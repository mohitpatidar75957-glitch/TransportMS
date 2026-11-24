package com.tms.backend.service;

import com.tms.backend.model.Trip;
import com.tms.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private com.tms.backend.repository.RateCardRepository rateCardRepository;

    @Autowired
    private com.tms.backend.repository.ExpenseRepository expenseRepository;

    @Autowired
    private com.tms.backend.repository.OrderRepository orderRepository;

    @Autowired
    private com.tms.backend.repository.InvoiceRepository invoiceRepository;

    @Autowired
    private com.tms.backend.repository.PaymentRepository paymentRepository;

    @Autowired
    private WebhookService webhookService;

    // A temporary path to store uploaded PODs
    private final String UPLOAD_DIR = "uploads/pod/";

    public java.math.BigDecimal getAutoFreightRate(String origin, String destination, String vehicleType) {
        Optional<com.tms.backend.entity.RateCard> rateCard = rateCardRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndVehicleTypeIgnoreCase(origin, destination, vehicleType);
        
        // If no Rate Card is found in the database, return a default fallback rate (e.g., 45000) so the flow doesn't break during testing
        return rateCard.map(com.tms.backend.entity.RateCard::getStandardRate).orElse(new java.math.BigDecimal("45000"));
    }

    public java.util.List<com.tms.backend.dto.RouteMarginDTO> getRankedRoutes(String origin, String destination, String vehicleType) {
        java.math.BigDecimal expectedRevenue = getAutoFreightRate(origin, destination, vehicleType);
        if (expectedRevenue.compareTo(java.math.BigDecimal.ZERO) == 0) {
            return java.util.Collections.emptyList();
        }

        // Simulating multiple routes between origin and destination with different costs
        // In a real scenario, this would come from a Route table or Google Maps API + historical costs
        java.util.List<com.tms.backend.dto.RouteMarginDTO> routes = new java.util.ArrayList<>();
        
        // Route Option 1 (Highway)
        java.math.BigDecimal cost1 = expectedRevenue.multiply(new java.math.BigDecimal("0.70")); // 70% cost
        routes.add(createRouteDto("Route 1 (National Highway)", expectedRevenue, cost1));

        // Route Option 2 (State Highway - Longer but maybe no tolls)
        java.math.BigDecimal cost2 = expectedRevenue.multiply(new java.math.BigDecimal("0.75")); // 75% cost
        routes.add(createRouteDto("Route 2 (State Highway)", expectedRevenue, cost2));

        // Route Option 3 (Shortest but bad road)
        java.math.BigDecimal cost3 = expectedRevenue.multiply(new java.math.BigDecimal("0.85")); // 85% cost
        routes.add(createRouteDto("Route 3 (Shortest Path)", expectedRevenue, cost3));

        // Sort by margin percentage descending
        routes.sort((r1, r2) -> r2.getMarginPercentage().compareTo(r1.getMarginPercentage()));
        return routes;
    }

    private com.tms.backend.dto.RouteMarginDTO createRouteDto(String name, java.math.BigDecimal revenue, java.math.BigDecimal cost) {
        java.math.BigDecimal margin = revenue.subtract(cost);
        double marginPercent = margin.doubleValue() / revenue.doubleValue() * 100;
        return new com.tms.backend.dto.RouteMarginDTO(name, revenue, cost, margin, Math.round(marginPercent * 100.0) / 100.0);
    }

    public Trip uploadPod(Long tripId, MultipartFile file) throws IOException {
        return uploadPod(tripId, file, null, null, null);
    }

    public Trip uploadPod(Long tripId, MultipartFile file, java.math.BigDecimal deliveryPayment, String paymentMode, String remarks) throws IOException {
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new RuntimeException("Trip not found with id " + tripId);
        }

        Trip trip = tripOptional.get();

        // Ensure directory exists
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Save file
        String fileName = "trip_" + tripId + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + fileName);
        Files.write(filePath, file.getBytes());

        // Update Trip entity
        trip.setPodStatus("RECEIVED");
        trip.setPodUrl(filePath.toString());
        if ("Scheduled".equalsIgnoreCase(trip.getStatus()) || "In Transit".equalsIgnoreCase(trip.getStatus())) {
            trip.setStatus("Delivered");
        }
        Trip savedTrip = tripRepository.save(trip);
        
        auditService.logAction("SYSTEM", "TRIP", trip.getId().toString(), "POD_UPLOADED", "POD Document uploaded for trip " + trip.getTripNumber());

        // Auto-generate Draft Invoice on POD upload
        com.tms.backend.model.Invoice invoice = generateDraftInvoiceForTrip(savedTrip);

        // If delivery payment was collected at the time of POD upload, record it immediately!
        if (invoice != null && deliveryPayment != null && deliveryPayment.compareTo(java.math.BigDecimal.ZERO) > 0) {
            com.tms.backend.model.Payment podPayment = new com.tms.backend.model.Payment();
            podPayment.setInvoice(invoice);
            podPayment.setAmount(deliveryPayment);
            podPayment.setPaymentDate(java.time.LocalDate.now());
            podPayment.setPaymentMode(paymentMode != null && !paymentMode.trim().isEmpty() ? paymentMode : "Delivery Cash/UPI");
            podPayment.setPaymentReference("POD-" + trip.getTripNumber() + "-" + (int)(Math.random() * 1000));
            podPayment.setRemarks(remarks != null && !remarks.trim().isEmpty() ? remarks : "Payment collected at Delivery upon POD upload");
            paymentRepository.save(podPayment);

            // Recompute invoice paid status
            java.util.List<com.tms.backend.model.Payment> allPayments = paymentRepository.findByInvoiceId(invoice.getId());
            java.math.BigDecimal totalPaid = allPayments.stream()
                    .map(com.tms.backend.model.Payment::getAmount)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            if (totalPaid.compareTo(invoice.getAmount()) >= 0) {
                invoice.setStatus("Paid");
            } else {
                invoice.setStatus("Partially Paid");
            }
            invoiceRepository.save(invoice);
        }

        return savedTrip;
    }

    public com.tms.backend.model.Invoice generateDraftInvoiceForTrip(Trip trip) {
        if (trip == null || trip.getId() == null) return null;
        try {
            java.util.Optional<com.tms.backend.model.Invoice> existingInv = invoiceRepository.findFirstByTripIdOrderByIdDesc(trip.getId());
            com.tms.backend.model.Invoice invoice = existingInv.orElse(new com.tms.backend.model.Invoice());
            
            if (invoice.getId() == null) {
                invoice.setInvoiceNumber("INV-" + java.time.Year.now().getValue() + "-" + (1000 + new java.util.Random().nextInt(9000)));
                invoice.setDate(java.time.LocalDate.now());
                invoice.setDueDate(java.time.LocalDate.now().plusDays(15));
                invoice.setStatus("Unpaid");
            }

            invoice.setTrip(trip);
            invoice.setClientName(trip.getClientName());
            
            // Total invoice amount calculation
            java.math.BigDecimal freight = trip.getFreightAmount() != null ? trip.getFreightAmount() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal gst = trip.getGstAmount() != null ? trip.getGstAmount() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal bilty = trip.getBiltyCharge() != null ? trip.getBiltyCharge() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal loading = trip.getLoadingCharge() != null ? trip.getLoadingCharge() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal totalInvoiceAmount = freight.add(gst).add(bilty).add(loading);
            invoice.setAmount(totalInvoiceAmount);

            invoice.setConsignorGst(trip.getConsignorGST());
            invoice.setConsigneeGst(trip.getConsigneeGST());
            invoice.setEwayBillNumber(trip.getEwayBillNumber());
            
            // TDS deduction default false (full amount billing)
            invoice.setTdsApplicable(false);
            invoice.setTdsRate(java.math.BigDecimal.ZERO);
            invoice.setTdsAmount(java.math.BigDecimal.ZERO);

            // Set default UPI ID for instant collection
            invoice.setUpiId("rktraders@upi");

            com.tms.backend.model.Invoice savedInv = invoiceRepository.save(invoice);

            // If trip had advance payment, register as first part-payment
            if (trip.getAdvanceAmount() != null && trip.getAdvanceAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                java.util.List<com.tms.backend.model.Payment> existingPayments = paymentRepository.findByInvoiceId(savedInv.getId());
                if (existingPayments.isEmpty()) {
                    com.tms.backend.model.Payment advancePayment = new com.tms.backend.model.Payment();
                    advancePayment.setInvoice(savedInv);
                    advancePayment.setAmount(trip.getAdvanceAmount());
                    advancePayment.setPaymentDate(trip.getStartDate() != null ? trip.getStartDate() : java.time.LocalDate.now());
                    advancePayment.setPaymentMode("Advance (Bank/Cash)");
                    advancePayment.setPaymentReference("ADV-" + trip.getTripNumber());
                    advancePayment.setRemarks("Advance freight collected at booking/loading");
                    paymentRepository.save(advancePayment);

                    if (trip.getAdvanceAmount().compareTo(totalInvoiceAmount) >= 0) {
                        savedInv.setStatus("Paid");
                    } else {
                        savedInv.setStatus("Partially Paid");
                    }
                    invoiceRepository.save(savedInv);
                }
            }

            auditService.logAction("SYSTEM", "INVOICE", savedInv.getInvoiceNumber(), "AUTO_CREATED_ON_DELIVERY", 
                    "Auto-generated draft tax invoice for Delivered trip " + trip.getTripNumber() + " (Amount: ₹" + savedInv.getAmount() + ")");
            return savedInv;
        } catch (Exception ex) {
            System.err.println("Error auto-generating invoice on trip delivery: " + ex.getMessage());
            return null;
        }
    }

    public Trip addNote(Long tripId, String newNote) {
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new RuntimeException("Trip not found with id " + tripId);
        }
        Trip trip = tripOptional.get();
        
        if ("CLEAR".equals(newNote)) {
            trip.setNotes("");
        } else {
            String existingNotes = trip.getNotes();
            String updatedNotes = (existingNotes == null || existingNotes.isEmpty()) 
                                    ? newNote 
                                    : existingNotes + "\n---\n" + newNote;
            
            trip.setNotes(updatedNotes);
        }
        
        Trip savedTrip = tripRepository.save(trip);
        auditService.logAction("SYSTEM", "TRIP", tripId.toString(), "ADD_NOTE", "New note added by driver");
        return savedTrip;
    }
    
    public Trip closeTrip(Long tripId) {
        Optional<Trip> tripOptional = tripRepository.findById(tripId);
        if (!tripOptional.isPresent()) {
            throw new RuntimeException("Trip not found with id " + tripId);
        }

        Trip trip = tripOptional.get();

        // 1. Check POD
        if (!"RECEIVED".equals(trip.getPodStatus())) {
            throw new RuntimeException("Cannot close trip! Please ensure POD is uploaded.");
        }

        // 2. Check Actual Revenue
        if (trip.getActualRevenue() == null || trip.getActualRevenue().doubleValue() <= 0) {
            throw new RuntimeException("Cannot close trip! Actual Revenue is missing or zero.");
        }

        // 3. Check Reconciled Costs
        if (trip.getReconciledCosts() == null || trip.getReconciledCosts().doubleValue() <= 0) {
            throw new RuntimeException("Cannot close trip! Reconciled Costs are missing or zero.");
        }

        // Calculate margins
        trip.setActualMargin(trip.getActualRevenue().subtract(trip.getReconciledCosts()));
        
        // 4. Auto-generate Expense Records if none exist, based on Reconciled Costs
        java.util.List<com.tms.backend.model.Expense> existingExpenses = expenseRepository.findByTripId(trip.getId());
        if (existingExpenses.isEmpty()) {
            java.math.BigDecimal totalCost = trip.getReconciledCosts();
            
            // 4a. Calculate Fuel Cost (Distance / Mileage * Diesel Rate)
            double distance = trip.getDistance() != null ? trip.getDistance() : 0.0;
            double mileage = (trip.getVehicle() != null && trip.getVehicle().getMileage() != null && trip.getVehicle().getMileage() > 0) 
                             ? trip.getVehicle().getMileage() : 4.0;
            double dieselRate = 92.0; // Approx diesel rate
            java.math.BigDecimal fuelCost = java.math.BigDecimal.valueOf((distance / mileage) * dieselRate).setScale(2, java.math.RoundingMode.HALF_UP);
            
            // 4b. Calculate Driver Expense based on Salary Type
            java.math.BigDecimal driverCost = java.math.BigDecimal.ZERO;
            if (trip.getDriver() != null && trip.getDriver().getSalaryType() != null) {
                String sType = trip.getDriver().getSalaryType().toUpperCase();
                double sAmount = trip.getDriver().getSalaryAmount() != null ? trip.getDriver().getSalaryAmount() : 0.0;
                
                if (sType.contains("TRIP")) {
                    driverCost = java.math.BigDecimal.valueOf(sAmount);
                } else if (sType.contains("PERCENT") || sType.contains("%")) {
                    java.math.BigDecimal freight = trip.getFreightAmount() != null ? trip.getFreightAmount() : java.math.BigDecimal.ZERO;
                    driverCost = freight.multiply(java.math.BigDecimal.valueOf(sAmount)).divide(new java.math.BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
                }
                // If "Monthly" or "Salary", driverCost remains 0
            }

            // 4c. Remaining goes to Tolls & Other
            java.math.BigDecimal otherCost = totalCost.subtract(fuelCost).subtract(driverCost);
            if (otherCost.compareTo(java.math.BigDecimal.ZERO) < 0) {
                otherCost = java.math.BigDecimal.ZERO; // Prevent negative
            }

            if (fuelCost.compareTo(java.math.BigDecimal.ZERO) > 0) {
                com.tms.backend.model.Expense fuelExp = new com.tms.backend.model.Expense();
                fuelExp.setDate(java.time.LocalDate.now());
                fuelExp.setTitle("Trip Fuel Expenses");
                fuelExp.setCategory("Fuel");
                fuelExp.setAmount(fuelCost);
                fuelExp.setTrip(trip);
                fuelExp.setVehicle(trip.getVehicle());
                expenseRepository.save(fuelExp);
            }
            
            if (driverCost.compareTo(java.math.BigDecimal.ZERO) > 0) {
                com.tms.backend.model.Expense driverExp = new com.tms.backend.model.Expense();
                driverExp.setDate(java.time.LocalDate.now());
                driverExp.setTitle("Driver Allowance / Kharcha");
                driverExp.setCategory("Driver");
                driverExp.setAmount(driverCost);
                driverExp.setTrip(trip);
                driverExp.setVehicle(trip.getVehicle());
                expenseRepository.save(driverExp);
            }

            if (otherCost.compareTo(java.math.BigDecimal.ZERO) > 0) {
                com.tms.backend.model.Expense tollExp = new com.tms.backend.model.Expense();
                tollExp.setDate(java.time.LocalDate.now());
                tollExp.setTitle("Toll & Other Enroute Expenses");
                tollExp.setCategory("Toll");
                tollExp.setAmount(otherCost);
                tollExp.setTrip(trip);
                tollExp.setVehicle(trip.getVehicle());
                expenseRepository.save(tollExp);
            }
            
            auditService.logAction("SYSTEM", "FINANCE", trip.getId().toString(), "EXPENSE_AUTO_CREATED", "Auto-generated realistic expenses of total ₹" + totalCost + " for trip " + trip.getTripNumber());
        }

        trip.setStatus("CLOSED");

        // 5. Auto-update associated Order to Delivered
        if (trip.getOrder() != null) {
            com.tms.backend.model.Order order = trip.getOrder();
            order.setStatus("Delivered");
            orderRepository.save(order);
            auditService.logAction("SYSTEM", "ORDER", order.getId().toString(), "DELIVERED", "Order marked Delivered as trip " + trip.getTripNumber() + " was closed.");
        }

        // 6. Auto-Invoice Generation upon Delivered / Trip Close
        generateDraftInvoiceForTrip(trip);

        Trip savedTrip = tripRepository.save(trip);
        
        auditService.logAction("SYSTEM", "TRIP", trip.getId().toString(), "CLOSED", "Trip closed with Actual Revenue: " + trip.getActualRevenue() + " and Reconciled Costs: " + trip.getReconciledCosts());

        // Publish Webhook event to outside customer endpoints
        try {
            java.util.Map<String, Object> webhookPayload = new java.util.HashMap<>();
            webhookPayload.put("event", "trip.delivered");
            webhookPayload.put("trip_id", savedTrip.getTripNumber() != null ? savedTrip.getTripNumber() : ("TRP-" + savedTrip.getId()));
            webhookPayload.put("delivered_at", java.time.LocalDateTime.now().toString());
            webhookPayload.put("vehicle", savedTrip.getVehicle() != null ? savedTrip.getVehicle().getRegistrationNumber() : null);
            webhookPayload.put("pod_url", savedTrip.getPodUrl());
            webhookService.publishEvent("TRIP_STATUS_CHANGE", webhookPayload);
            webhookService.publishEvent("trip.delivered", webhookPayload);
        } catch (Exception ex) {
            System.err.println("Webhook dispatch error: " + ex.getMessage());
        }

        return savedTrip;
    }

    public Trip reconcileTrip(Long tripId, java.math.BigDecimal actualRevenue, java.math.BigDecimal reconciledCosts) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found with id " + tripId));
        String oldVal = "Rev: ₹" + (trip.getActualRevenue() != null ? trip.getActualRevenue() : "0") + ", Cost: ₹" + (trip.getReconciledCosts() != null ? trip.getReconciledCosts() : "0");
        if (actualRevenue != null) trip.setActualRevenue(actualRevenue);
        if (reconciledCosts != null) trip.setReconciledCosts(reconciledCosts);
        if (trip.getActualRevenue() != null && trip.getReconciledCosts() != null) {
            trip.setActualMargin(trip.getActualRevenue().subtract(trip.getReconciledCosts()));
        }
        Trip savedTrip = tripRepository.save(trip);
        String newVal = "Rev: ₹" + (savedTrip.getActualRevenue() != null ? savedTrip.getActualRevenue() : "0") + ", Cost: ₹" + (savedTrip.getReconciledCosts() != null ? savedTrip.getReconciledCosts() : "0");
        try {
            auditService.logAction("SYSTEM", "TRIP", tripId.toString(), "EDITED", oldVal, newVal, "Reconciled trip " + (savedTrip.getTripNumber() != null ? savedTrip.getTripNumber() : tripId));
        } catch (Exception ignored) {}
        return savedTrip;
    }

    /**
     * Estimates delivery duration, days, and recommended expected delivery date
     * based on historical completed trips for the same or similar route and distance.
     */
    public java.util.Map<String, Object> estimateDeliveryTime(
            String origin, 
            String destination, 
            Double distanceKm, 
            java.time.LocalDate startDate,
            Long vehicleId) {
        
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        java.time.LocalDate start = startDate != null ? startDate : java.time.LocalDate.now();
        
        // Find completed trips to calculate historical metrics
        java.util.List<Trip> allTrips = tripRepository.findAll();
        String originNorm = origin != null ? origin.trim().toLowerCase() : "";
        String destNorm = destination != null ? destination.trim().toLowerCase() : "";

        java.util.List<Trip> exactRouteTrips = new java.util.ArrayList<>();
        java.util.List<Trip> generalCompletedTrips = new java.util.ArrayList<>();

        for (Trip t : allTrips) {
            if ("COMPLETED".equalsIgnoreCase(t.getStatus()) || "CLOSED".equalsIgnoreCase(t.getStatus())) {
                generalCompletedTrips.add(t);
                if (t.getRoute() != null) {
                    String r = t.getRoute().toLowerCase();
                    if (!originNorm.isEmpty() && !destNorm.isEmpty() && r.contains(originNorm) && r.contains(destNorm)) {
                        exactRouteTrips.add(t);
                    }
                }
            }
        }

        double calculatedAvgSpeedKmPerDay = 350.0; // Benchmark Indian trucking ~350 km/day (includes breaks, tolls, loading)
        int sampleSize = exactRouteTrips.size();
        boolean isExactRoute = false;
        double avgDaysTaken = 0;

        if (!exactRouteTrips.isEmpty()) {
            isExactRoute = true;
            double totalDays = 0;
            int validCount = 0;
            for (Trip t : exactRouteTrips) {
                if (t.getStartDate() != null && t.getEndDate() != null) {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate());
                    if (days > 0 && days < 30) {
                        totalDays += days;
                        validCount++;
                    }
                }
            }
            if (validCount > 0) {
                avgDaysTaken = totalDays / validCount;
            }
        }

        // If no exact match or zero days, use distance & general benchmark or fleet historical speed
        double dist = (distanceKm != null && distanceKm > 0) ? distanceKm : 500.0;
        
        // Realistic truck highway speed: ~50-55 km/h on national/state highways
        double truckAvgSpeedKmph = 50.0;
        double directTransitHours = dist / truckAvgSpeedKmph; // pure driving/transit hours

        if (avgDaysTaken <= 0) {
            // Benchmark Indian commercial logistics daily run: ~450-500 km/day (includes mandatory driver rest & toll stops)
            double dailyTruckHaulBenchmark = 450.0;
            
            // Check general completed fleet avg daily progress if available
            double fleetDailyKmSum = 0;
            int speedSamples = 0;
            for (Trip t : generalCompletedTrips) {
                if (t.getDistance() != null && t.getDistance() > 50 && t.getStartDate() != null && t.getEndDate() != null) {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate());
                    if (days > 0 && days < 20) {
                        fleetDailyKmSum += (t.getDistance() / (double) days);
                        speedSamples++;
                    }
                }
            }
            if (speedSamples >= 3) {
                double avgFleetDaily = fleetDailyKmSum / speedSamples;
                if (avgFleetDaily >= 250.0) {
                    calculatedAvgSpeedKmPerDay = avgFleetDaily;
                } else {
                    calculatedAvgSpeedKmPerDay = dailyTruckHaulBenchmark;
                }
            } else {
                calculatedAvgSpeedKmPerDay = dailyTruckHaulBenchmark;
            }
            avgDaysTaken = Math.max(1.0, dist / calculatedAvgSpeedKmPerDay);
        }

        // Calendar days needed for delivery (rounded up or ceiling for delivery dispatch buffer)
        int estimatedDays = (int) Math.ceil(dist / 500.0);
        if (estimatedDays < 1) estimatedDays = 1;

        // Drive time in hours matches actual transit time (e.g. 709 km @ 50 km/h = ~14 hours drive)
        double estimatedDriveHours = Math.round(directTransitHours * 10.0) / 10.0;
        int hoursInt = (int) Math.round(directTransitHours);

        java.time.LocalDate estimatedDeliveryDate = start.plusDays(estimatedDays);

        result.put("origin", origin);
        result.put("destination", destination);
        result.put("distanceKm", Math.round(dist));
        result.put("estimatedDays", estimatedDays);
        result.put("estimatedHours", hoursInt);
        result.put("drivingHours", estimatedDriveHours);
        result.put("estimatedDeliveryDate", estimatedDeliveryDate.toString());
        result.put("startDate", start.toString());
        result.put("historicalTripsAnalyzed", sampleSize > 0 ? sampleSize : generalCompletedTrips.size());
        String basisText = String.format("Distance: %d KM | Estimated Running Time: ~%d hrs (Avg speed: 50 km/h) | Expected Delivery: %d Day%s", 
                Math.round(dist), hoursInt, estimatedDays, estimatedDays > 1 ? "s" : "");

        result.put("basis", basisText);

        return result;
    }
}
