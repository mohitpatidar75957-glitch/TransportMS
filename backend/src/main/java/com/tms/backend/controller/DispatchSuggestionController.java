package com.tms.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/dispatch")
@CrossOrigin(origins = "*")
public class DispatchSuggestionController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * GET /api/v1/dispatch/suggest?orderId=123
     * Returns top 3 truck+driver suggestions for a given order.
     * Pure rule-based, no AI. Safe: nothing is saved until user confirms.
     */
    @GetMapping("/suggest")
    public ResponseEntity<?> suggest(@RequestParam Long orderId) {
        Map<String, Object> response = new HashMap<>();

        Long tenantId = com.tms.backend.config.TenantContext.getCurrentTenant();
        if (tenantId == null) {
            tenantId = 1L;
        }

        // 1. Fetch the order strictly for the current company
        List<Map<String, Object>> orders = jdbcTemplate.queryForList(
            "SELECT * FROM orders WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)", orderId, tenantId
        );
        if (orders.isEmpty()) {
            response.put("error", "Order not found");
            return ResponseEntity.badRequest().body(response);
        }
        Map<String, Object> order = orders.get(0);

        String pickup   = str(order.get("pickup_location"));
        String drop     = str(order.get("drop_location"));
        String weightStr = str(order.get("weight")); // e.g. "18 Tons"
        double orderWeight = parseWeight(weightStr);  // extract numeric tons
        String freight  = str(order.get("amount"));   // e.g. "₹45000"

        // 2. Filter VALID vehicles belonging ONLY to this company (Active + all docs valid > 30 days)
        String today30 = LocalDate.now().plusDays(30).toString();
        List<Map<String, Object>> vehicles = jdbcTemplate.queryForList(
            "SELECT * FROM vehicles WHERE (tenant_id = ? OR tenant_id IS NULL) AND status = 'Active' " +
            "AND insurance_expiry > ? " +
            "AND permit_expiry > ? " +
            "AND puc_expiry > ? " +
            "AND fitness_expiry > ?",
            tenantId, today30, today30, today30, today30
        );

        // 3. Filter AVAILABLE vehicles (no active/scheduled trip)
        List<Map<String, Object>> freeVehicles = new ArrayList<>();
        for (Map<String, Object> v : vehicles) {
            long vehicleId = ((Number) v.get("id")).longValue();
            String cap = str(v.get("capacity")); // e.g. "20 Tons"
            double capTons = parseWeight(cap);

            // Capacity check
            if (orderWeight > 0 && capTons > 0 && capTons < orderWeight) continue;

            // Not on an active trip within this company
            List<Map<String, Object>> activeTrips = jdbcTemplate.queryForList(
                "SELECT id FROM trips WHERE vehicle_id = ? AND status IN ('In Transit','Scheduled') AND (tenant_id = ? OR tenant_id IS NULL)", vehicleId, tenantId
            );
            if (activeTrips.isEmpty()) {
                freeVehicles.add(v);
            }
        }

        // 4. Filter AVAILABLE drivers belonging ONLY to this company (status=Available + license valid > 30 days)
        List<Map<String, Object>> drivers = jdbcTemplate.queryForList(
            "SELECT * FROM drivers WHERE (tenant_id = ? OR tenant_id IS NULL) AND status = 'Available' AND license_expiry > ?", tenantId, today30
        );

        // 5. Estimate realistic Route Distance
        double distanceKm = estimateRouteDistance(pickup, drop);
        double freightAmt = parseAmount(freight);

        // 6. Sort free vehicles by CAPACITY SUITABILITY
        // Priority 1: Trucks that can carry the order (capTons >= orderWeight)
        // Priority 2: Closest match to order weight (avoid deploying 40T truck for a 12T load when 16T is available!)
        // e.g. for 12-Ton shipment: 14T/16T truck has 75-85% utilization (ideal fit) vs 45T truck having 26% utilization (waste of capacity & high fuel).
        freeVehicles.sort((v1, v2) -> {
            double c1 = parseWeight(str(v1.get("capacity")));
            double c2 = parseWeight(str(v2.get("capacity")));

            if (orderWeight > 0) {
                // Both can carry: prefer smaller surplus capacity (best fit)
                double diff1 = c1 - orderWeight;
                double diff2 = c2 - orderWeight;
                return Double.compare(diff1, diff2);
            }
            return Double.compare(c1, c2);
        });

        // 7. Build smart combinations
        List<Map<String, Object>> suggestions = new ArrayList<>();

        for (int vIdx = 0; vIdx < freeVehicles.size() && vIdx < 5; vIdx++) {
            Map<String, Object> v = freeVehicles.get(vIdx);
            String capStr = str(v.get("capacity"));
            double capTons = parseWeight(capStr);
            long vehicleId = ((Number) v.get("id")).longValue();

            // Assign driver (round-robin / best available)
            if (drivers.isEmpty()) break;
            Map<String, Object> d = drivers.get(vIdx % drivers.size());
            long driverId = ((Number) d.get("id")).longValue();

            // Calculate capacity utilization percentage
            double utilizationPct = (orderWeight > 0 && capTons > 0) ? Math.min(100.0, (orderWeight / capTons) * 100.0) : 100.0;
            double surplusCapTons = Math.max(0.0, capTons - orderWeight);

            // Fit status tag
            String fitBadge;
            String fitDescription;
            if (orderWeight <= 0) {
                fitBadge = "Standard Fit";
                fitDescription = "Suitable for general cargo";
            } else if (utilizationPct >= 70.0 && utilizationPct <= 100.0) {
                fitBadge = "Optimal Fit 🎯";
                fitDescription = String.format("Best match: %.0f%% capacity utilized (%s tons load in %s tons truck)", utilizationPct, orderWeight, capTons);
            } else if (utilizationPct >= 50.0) {
                fitBadge = "Good Fit 👍";
                fitDescription = String.format("Adequate match: %.0f%% capacity utilized (%s tons reserve space)", utilizationPct, surplusCapTons);
            } else {
                fitBadge = "Fleet Oversized ⚠️";
                fitDescription = String.format("Oversized for %.0fT order (only %.0f%% utilized, %.0fT empty space) — no smaller truck available in fleet", 
                    orderWeight, utilizationPct, surplusCapTons);
            }

            // 1. Fuel Expense (based on truck capacity, vehicle engine condition, driver driving style)
            double fuelEstimate = estimateFuel(distanceKm, capTons, v, driverId);

            // 2. Toll Expense (realistic Indian NHAI toll rate ~ ₹1.8 - ₹2.5 / km for tonnage)
            double tollEstimate = estimateToll(distanceKm, capTons);

            // 3. Driver Expense (salary structure / trip allowance / kharcha bata)
            double driverCost = estimateDriverCost(d, distanceKm, freightAmt);

            // Total realistic operational trip expenses
            double totalExpenses = fuelEstimate + tollEstimate + driverCost;

            // Net Expected Profit
            double expectedProfit = freightAmt > 0 ? (freightAmt - totalExpenses) : 0;
            double profitMarginPct = freightAmt > 0 ? ((expectedProfit / freightAmt) * 100.0) : 0;

            // Smart Ranking Score: Combines Profit + Capacity Utilization Fit
            // Optimal truck (e.g. 14T truck for 12T load) saves fuel & preserves heavy trucks for heavy orders
            double suitabilityScore = (utilizationPct * 1000.0) + expectedProfit;

            Map<String, Object> s = new LinkedHashMap<>();
            s.put("vehicleId",       vehicleId);
            s.put("vehicleReg",      str(v.get("registration_number")));
            s.put("vehicleName",     str(v.get("name")));
            s.put("vehicleCapacity", str(v.get("capacity")));
            s.put("capacityTons",    capTons);
            s.put("orderWeightTons", orderWeight);
            s.put("utilizationPct",  Math.round(utilizationPct * 10.0) / 10.0);
            s.put("fitBadge",        fitBadge);
            s.put("fitDescription",  fitDescription);
            s.put("suitabilityScore",suitabilityScore);
            s.put("vehicleStatus",   str(v.get("status")));
            s.put("insuranceExpiry", str(v.get("insurance_expiry")));
            s.put("permitExpiry",    str(v.get("permit_expiry")));

            s.put("driverId",        driverId);
            s.put("driverName",      str(d.get("name")));
            s.put("driverPhone",     str(d.get("phone")));
            s.put("driverLicense",   str(d.get("license_number")));
            s.put("licenseExpiry",   str(d.get("license_expiry")));
            s.put("salaryType",      str(d.get("salary_type")));

            s.put("distanceKm",      Math.round(distanceKm));
            s.put("freightAmount",   freightAmt);
            s.put("estimatedFuel",   Math.round(fuelEstimate));
            s.put("estimatedToll",   Math.round(tollEstimate));
            s.put("driverCost",      Math.round(driverCost));
            s.put("totalExpenses",   Math.round(totalExpenses));
            s.put("expectedProfit",  Math.round(expectedProfit));
            s.put("profitMarginPct", Math.round(profitMarginPct * 10.0) / 10.0);
            s.put("route",           pickup + " → " + drop);

            String profitText = "";
            if (freightAmt > 0) {
                if (expectedProfit >= 0) {
                    profitText = String.format("Expected Profit: ₹%,d (%.1f%% margin).", Math.round(expectedProfit), profitMarginPct);
                } else {
                    profitText = String.format("⚠️ Expected Loss: -₹%,d (%.1f%% loss - consider raising freight or reducing deadhaul).", Math.round(Math.abs(expectedProfit)), Math.abs(profitMarginPct));
                }
            }

            // Detailed reason string with capacity fit & expenses
            String reasonText = String.format(
                "[%s] Truck %s (Cap: %s) matched for %s shipment. " +
                "Estimated Cost: ₹%,d (Fuel: ₹%,d, Toll: ₹%,d, Driver: ₹%,d). %s",
                fitBadge,
                str(v.get("registration_number")),
                str(v.get("capacity")),
                weightStr.isEmpty() ? "order" : weightStr,
                Math.round(totalExpenses),
                Math.round(fuelEstimate),
                Math.round(tollEstimate),
                Math.round(driverCost),
                profitText
            );
            s.put("reason", reasonText);

            suggestions.add(s);
        }

        // Sort suggestions primarily by highest expected profit among viable trucks.
        // If profits are equal or close, prefer higher capacity utilization fit.
        suggestions.sort((a, b) -> {
            double profitA = ((Number) a.getOrDefault("expectedProfit", 0)).doubleValue();
            double profitB = ((Number) b.getOrDefault("expectedProfit", 0)).doubleValue();
            if (Double.compare(profitB, profitA) != 0) {
                return Double.compare(profitB, profitA); // Highest profit first
            }
            double utilA = ((Number) a.getOrDefault("utilizationPct", 0)).doubleValue();
            double utilB = ((Number) b.getOrDefault("utilizationPct", 0)).doubleValue();
            return Double.compare(utilB, utilA);
        });
        List<Map<String, Object>> top3 = suggestions.size() > 3 ? suggestions.subList(0, 3) : suggestions;

        response.put("orderId",     orderId);
        response.put("orderInfo",   Map.of(
            "customer",   str(order.get("customer_name")),
            "route",      pickup + " → " + drop,
            "weight",     weightStr,
            "freight",    freight,
            "date",       str(order.get("expected_date")),
            "distanceKm", Math.round(distanceKm)
        ));
        response.put("suggestions", top3);
        response.put("totalVehiclesChecked", vehicles.size());
        response.put("totalDriversChecked",  drivers.size());

        if (top3.isEmpty()) {
            response.put("message", "No suitable truck+driver found. Check: documents expiring, all trucks busy, or no available drivers.");
        } else {
            response.put("message", "Found " + top3.size() + " suggestion(s). Review and confirm to create a trip.");
        }

        return ResponseEntity.ok(response);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private String str(Object o) {
        return o != null ? o.toString() : "";
    }

    /** Extract numeric tons from strings like "20 Tons", "18T", "18" */
    private double parseWeight(String s) {
        if (s == null || s.isBlank()) return 0;
        try {
            return Double.parseDouble(s.replaceAll("[^0-9.]", "").trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /** Extract amount from strings like "₹45000", "45000", "Rs.45,000" */
    private double parseAmount(String s) {
        if (s == null || s.isBlank()) return 0;
        try {
            return Double.parseDouble(s.replaceAll("[^0-9.]", "").trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /**
     * Estimates route distance using historical trips or realistic city pair approximations
     */
    private double estimateRouteDistance(String from, String to) {
        String fromNorm = from != null ? from.trim().toLowerCase() : "";
        String toNorm = to != null ? to.trim().toLowerCase() : "";

        // Common Indian logistics route standard highway distances
        if ((fromNorm.contains("delhi") && toNorm.contains("mumbai")) || (fromNorm.contains("mumbai") && toNorm.contains("delhi"))) return 1420.0;
        if ((fromNorm.contains("delhi") && toNorm.contains("jaipur")) || (fromNorm.contains("jaipur") && toNorm.contains("delhi"))) return 280.0;
        if ((fromNorm.contains("delhi") && toNorm.contains("ahmedabad")) || (fromNorm.contains("ahmedabad") && toNorm.contains("delhi"))) return 940.0;
        if ((fromNorm.contains("delhi") && toNorm.contains("kolkata")) || (fromNorm.contains("kolkata") && toNorm.contains("delhi"))) return 1530.0;
        if ((fromNorm.contains("delhi") && toNorm.contains("chandigarh")) || (fromNorm.contains("chandigarh") && toNorm.contains("delhi"))) return 250.0;
        if ((fromNorm.contains("mumbai") && toNorm.contains("pune")) || (fromNorm.contains("pune") && toNorm.contains("mumbai"))) return 150.0;
        if ((fromNorm.contains("mumbai") && toNorm.contains("bangalore")) || (fromNorm.contains("bangalore") && toNorm.contains("mumbai"))) return 980.0;
        if ((fromNorm.contains("mumbai") && toNorm.contains("hyderabad")) || (fromNorm.contains("hyderabad") && toNorm.contains("mumbai"))) return 710.0;
        if ((fromNorm.contains("bangalore") && toNorm.contains("chennai")) || (fromNorm.contains("chennai") && toNorm.contains("bangalore"))) return 350.0;
        if ((fromNorm.contains("bangalore") && toNorm.contains("hyderabad")) || (fromNorm.contains("hyderabad") && toNorm.contains("bangalore"))) return 570.0;
        if ((fromNorm.contains("chennai") && toNorm.contains("hyderabad")) || (fromNorm.contains("hyderabad") && toNorm.contains("chennai"))) return 630.0;
        if ((fromNorm.contains("indore") && toNorm.contains("pune")) || (fromNorm.contains("pune") && toNorm.contains("indore"))) return 550.0;
        if ((fromNorm.contains("indore") && toNorm.contains("mumbai")) || (fromNorm.contains("mumbai") && toNorm.contains("indore"))) return 585.0;
        if ((fromNorm.contains("indore") && toNorm.contains("bhopal")) || (fromNorm.contains("bhopal") && toNorm.contains("indore"))) return 195.0;

        // Check if there are any completed trips with this route
        try {
            List<Map<String, Object>> tripDistances = jdbcTemplate.queryForList(
                "SELECT distance FROM trips WHERE route LIKE ? AND route LIKE ? AND distance IS NOT NULL AND distance > 20 LIMIT 1",
                "%" + fromNorm + "%", "%" + toNorm + "%"
            );
            if (!tripDistances.isEmpty() && tripDistances.get(0).get("distance") != null) {
                double histDist = ((Number) tripDistances.get(0).get("distance")).doubleValue();
                if (histDist > 20) return histDist;
            }
        } catch (Exception ignored) {}

        // Realistic standard freight haul default distance (approx 550 km)
        return 550.0;
    }

    /**
     * Calculates realistic fuel cost based on distance, actual vehicle mileage, truck capacity/tonnage, and minor driver efficiencies.
     * Uses actual vehicle mileage if recorded in vehicle profile (e.g. 3.5 - 7.0 km/l) and prevailing commercial diesel rates (~₹91.5 - ₹92.0/L).
     */
    private double estimateFuel(double distanceKm, double capacityTons, Map<String, Object> vehicleMap, long driverId) {
        double mileage = 4.0; // default for 16-25 ton truck

        // 1. First preference: Use the vehicle's actual configured mileage from database
        try {
            if (vehicleMap != null && vehicleMap.get("mileage") != null) {
                double vehMileage = ((Number) vehicleMap.get("mileage")).doubleValue();
                if (vehMileage >= 1.5 && vehMileage <= 20.0) {
                    mileage = vehMileage;
                }
            }
        } catch (Exception ignored) {}

        // 2. If vehicle has no custom mileage, use realistic tonnage-based Indian fleet baseline
        if (mileage == 4.0) {
            if (capacityTons >= 40) {
                mileage = 3.2; // 40T-49T heavy trailers
            } else if (capacityTons >= 28) {
                mileage = 3.6; // 28T-35T multi-axle trucks
            } else if (capacityTons >= 16) {
                mileage = 4.2; // 16T-25T standard trucks
            } else if (capacityTons >= 9) {
                mileage = 5.2; // 9T-15T medium trucks
            } else if (capacityTons > 0) {
                mileage = 7.0; // Light commercial vehicle (e.g. 3-7 Ton)
            }
        }

        // Add minor driver habit variation (±0.1 km/l)
        double driverVariation = (driverId % 5 - 2) * 0.05;
        mileage = Math.max(2.5, mileage + driverVariation);

        // Prevailing average commercial diesel rate in Western/Central India corridor (₹91.8 / L)
        double dieselPrice = 91.8;
        return (distanceKm / mileage) * dieselPrice;
    }

    /**
     * Calculates realistic toll expenses based on distance and vehicle tonnage.
     * NHAI toll rates for commercial vehicles typically range between ₹1.8 and ₹2.6 per km.
     */
    private double estimateToll(double distanceKm, double capacityTons) {
        if (distanceKm <= 0) return 0;

        // Toll rate multiplier per km depending on axle / tonnage
        double tollRatePerKm = 1.8;
        if (capacityTons >= 25) {
            tollRatePerKm = 2.5; // Multi-axle commercial
        } else if (capacityTons >= 16) {
            tollRatePerKm = 2.1; // 2-3 axle heavy truck
        } else if (capacityTons < 10) {
            tollRatePerKm = 1.4; // LCV / medium truck
        }

        // Tolls usually occur every ~50-60 km on National Highways
        double rawToll = distanceKm * tollRatePerKm;
        return Math.max(150.0, Math.round(rawToll / 50.0) * 50.0);
    }

    /**
     * Calculates realistic driver costs (trip allowance / bata / per-trip pay)
     */
    private double estimateDriverCost(Map<String, Object> driverMap, double distanceKm, double freightAmt) {
        String salaryType = str(driverMap.get("salary_type")).trim().toUpperCase();
        double salaryAmount = 0;
        try {
            if (driverMap.get("salary_amount") != null) {
                salaryAmount = ((Number) driverMap.get("salary_amount")).doubleValue();
            }
        } catch (Exception ignored) {}

        // Base trip food & daily bata allowance (standard ~₹500-₹700 per 400 km travel day)
        double estimatedTripDays = Math.max(1.0, Math.ceil(distanceKm / 400.0));
        double dailyBata = estimatedTripDays * 500.0; // ₹500/day driver daily food & on-road allowance

        if (salaryType.contains("TRIP")) {
            // Per trip salary: driver gets their trip amount + daily bata
            double perTripPay = salaryAmount > 0 ? salaryAmount : 1200.0;
            return perTripPay + dailyBata;
        } else if (salaryType.contains("PERCENT") || salaryType.contains("%")) {
            // Percentage of freight: e.g. 5-8%
            double pct = salaryAmount > 0 ? salaryAmount : 6.0;
            double pctPay = freightAmt > 0 ? (freightAmt * (pct / 100.0)) : 1000.0;
            return pctPay + dailyBata;
        } else {
            // "Monthly" salaried driver: trip cost incurs daily driver allowance (bata/kharcha)
            // plus prorated portion of trip salary (~₹800-₹1200/day equivalent)
            return dailyBata + (estimatedTripDays * 400.0);
        }
    }
}
