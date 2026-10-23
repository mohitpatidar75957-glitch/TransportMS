package com.tms.backend.controller;

import com.tms.backend.model.*;
import com.tms.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.tms.backend.entity.Notification;

@RestController
@RequestMapping("/api/v1/resources")
@CrossOrigin(originPatterns = "*")
public class ResourcesController {

    @Autowired private FuelRecordRepository fuelRecordRepository;
    @Autowired private VendorRepository vendorRepository;
    @Autowired private InventoryItemRepository inventoryItemRepository;



    @GetMapping("/fuel/check-anomaly")
    public java.util.Map<String, Object> checkFuelAnomaly(
            @RequestParam Long vehicleId,
            @RequestParam Double liters,
            @RequestParam(required = false) Double odometerReading,
            @RequestParam(required = false) Double routeDistanceKm) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("isFlagged", false);
        response.put("reason", null);

        if (liters != null && vehicleId != null && liters > 0) {
            Vehicle v = vehicleRepository.findById(vehicleId).orElse(null);
            double vehicleMileage = (v != null && v.getMileage() != null && v.getMileage() > 0) ? v.getMileage() : 4.0; // default commercial truck 4 km/L
            String vehicleReg = (v != null) ? v.getRegistrationNumber() : "Vehicle";

            double distance = 0.0;
            // Case 1: Route distance explicitly provided (e.g. 40 km route)
            if (routeDistanceKm != null && routeDistanceKm > 0) {
                distance = routeDistanceKm;
            } else if (odometerReading != null && odometerReading > 0) {
                // Case 2: Computed from odometer difference against previous fuel fill
                List<FuelRecord> history = fuelRecordRepository.findAll().stream()
                    .filter(f -> f.getVehicle() != null && f.getVehicle().getId().equals(vehicleId) && f.getOdometerReading() != null && f.getId() != null)
                    .sorted(java.util.Comparator.comparing(FuelRecord::getId).reversed())
                    .toList();

                if (!history.isEmpty()) {
                    FuelRecord prev = history.get(0);
                    distance = odometerReading - prev.getOdometerReading();
                } else {
                    // If first entry, assume reasonable default window if odometer difference cannot be computed
                    distance = 0.0;
                }
            }

            if (distance > 0) {
                double expectedLiters = distance / vehicleMileage;
                // Anomaly Rule: If entered liters exceeds 25% of expected liters
                // Example: 40 km route on 4.0 km/L needs 10 L. Entering 120 L has gap of 110 L (1100% excess)!
                if (liters > (expectedLiters * 1.25)) {
                    double gap = liters - expectedLiters;
                    double percentExcess = (gap / expectedLiters) * 100.0;
                    response.put("isFlagged", true);
                    response.put("distance", Math.round(distance * 10.0) / 10.0);
                    response.put("expectedLiters", Math.round(expectedLiters * 10.0) / 10.0);
                    response.put("enteredLiters", liters);
                    response.put("gapLiters", Math.round(gap * 10.0) / 10.0);
                    response.put("mileage", vehicleMileage);
                    response.put("reason", String.format(
                        "UNUSUAL FUEL CONSUMPTION WARNING: Travelled %.0f km on route. At standard mileage (%.1f km/L), expected fuel is ~%.1f L. You entered %.1f L (Spike of +%.1f L / %.0f%% excess!). Possible diesel pilferage or typo.",
                        distance, vehicleMileage, expectedLiters, liters, gap, percentExcess
                    ));
                }
            }
        }
        return response;
    }
    
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private com.tms.backend.service.AuditService auditService;

    // --- Fuel Records ---
    @GetMapping("/fuel")
    public List<FuelRecord> getAllFuelRecords() { return fuelRecordRepository.findAll(); }
    
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private VehicleRepository vehicleRepository;

    @PostMapping("/fuel")
    public FuelRecord createFuelRecord(@RequestBody FuelRecord fuelRecord, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        if (fuelRecord.getLiters() != null && fuelRecord.getVehicle() != null && fuelRecord.getVehicle().getId() != null) {
            Vehicle v = vehicleRepository.findById(fuelRecord.getVehicle().getId()).orElse(null);
            if (v != null && v.getMileage() != null && fuelRecord.getOdometerReading() != null) {
                // Find previous fuel record to get previous odometer
                List<FuelRecord> history = fuelRecordRepository.findAll().stream()
                    .filter(f -> f.getVehicle() != null && f.getVehicle().getId().equals(v.getId()) && f.getOdometerReading() != null && f.getId() != null)
                    .sorted(java.util.Comparator.comparing(FuelRecord::getId).reversed())
                    .toList();

                if (!history.isEmpty()) {
                    FuelRecord prev = history.get(0);
                    double distance = fuelRecord.getOdometerReading() - prev.getOdometerReading();
                    
                    if (distance > 0) {
                        double expectedLiters = distance / v.getMileage();
                        
                        // Fraud Rule: If actual liters is 20% more than expected liters based on distance
                        if (fuelRecord.getLiters() > (expectedLiters * 1.2)) {
                            double gap = fuelRecord.getLiters() - expectedLiters;
                            fuelRecord.setIsFlagged(true);
                            fuelRecord.setFlagReason(String.format("Fraud Alert: Travelled %.0f km. Expected %.1fL (Mileage %.1f). Filled %.1fL. Gap of %.1fL!", distance, expectedLiters, v.getMileage(), fuelRecord.getLiters(), gap));
                            
                            // Send Notification to Managers
                            Notification notif = new Notification();
                            notif.setTitle("⚠️ Possible Fuel Fraud Detected");
                            notif.setMessage("Vehicle " + v.getRegistrationNumber() + " flagged for excess fuel. Gap of " + Math.round(gap) + "L detected.");
                            notif.setDate(java.time.LocalDateTime.now());
                            notif.setRead(false);
                            notificationRepository.save(notif);
                        }
                    }
                }
            }
        }
        FuelRecord saved = fuelRecordRepository.save(fuelRecord);
        try {
            String veh = saved.getVehicle() != null ? saved.getVehicle().getRegistrationNumber() : "N/A";
            String newVal = veh + " (" + saved.getLiters() + "L, ₹" + saved.getTotalAmount() + ")";
            auditService.logAction(roleHeader, "Fuel", saved.getId(), "CREATED", null, newVal, "Added fuel record for vehicle " + veh);
        } catch (Exception ignored) {}
        return saved;
    }

    @DeleteMapping("/fuel/{id}")
    public ResponseEntity<?> deleteFuelRecord(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return fuelRecordRepository.findById(id).map(f -> {
            String veh = f.getVehicle() != null ? f.getVehicle().getRegistrationNumber() : "N/A";
            String oldVal = veh + " (" + f.getLiters() + "L, ₹" + f.getTotalAmount() + ")";
            fuelRecordRepository.delete(f);
            try {
                auditService.logAction(roleHeader, "Fuel", id, "DELETED", oldVal, null, "Deleted fuel record of " + veh);
            } catch (Exception ignored) {}
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Vendors ---
    @GetMapping("/vendors")
    public List<Vendor> getAllVendors() { return vendorRepository.findAll(); }
    
    @GetMapping("/vendors/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
        return vendorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/vendors")
    public ResponseEntity<?> createVendor(@RequestBody Vendor vendor, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        try {
            Vendor saved = vendorRepository.save(vendor);
            String newVal = saved.getName() + " (" + (saved.getMobileNumber() != null ? saved.getMobileNumber() : "No Contact") + ", Status: " + saved.getStatus() + ")";
            try {
                auditService.logAction(roleHeader, "Vendor", saved.getId(), "CREATED", null, newVal, "Created vendor " + saved.getName());
            } catch (Exception ignored) {}
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to save vendor to database: " + e.getMessage());
        }
    }
    
    @PutMapping("/vendors/{id}")
    public ResponseEntity<?> updateVendor(@PathVariable Long id, @RequestBody Vendor vendorDetails, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return vendorRepository.findById(id).map(vendor -> {
            try {
                String oldVal = vendor.getName() + " (" + (vendor.getMobileNumber() != null ? vendor.getMobileNumber() : "No Contact") + ", Status: " + vendor.getStatus() + ")";
                vendor.setName(vendorDetails.getName());
                vendor.setContactPerson(vendorDetails.getContactPerson());
                vendor.setMobileNumber(vendorDetails.getMobileNumber());
                vendor.setEmail(vendorDetails.getEmail());
                vendor.setAddress(vendorDetails.getAddress());
                vendor.setGstin(vendorDetails.getGstin());
                vendor.setPan(vendorDetails.getPan());
                vendor.setBankDetails(vendorDetails.getBankDetails());
                vendor.setStatus(vendorDetails.getStatus());
                vendor.setServices(vendorDetails.getServices());
                vendor.setBalance(vendorDetails.getBalance());
                Vendor updatedVendor = vendorRepository.save(vendor);
                String newVal = updatedVendor.getName() + " (" + (updatedVendor.getMobileNumber() != null ? updatedVendor.getMobileNumber() : "No Contact") + ", Status: " + updatedVendor.getStatus() + ")";
                try {
                    auditService.logAction(roleHeader, "Vendor", updatedVendor.getId(), "EDITED", oldVal, newVal, "Updated vendor " + updatedVendor.getName());
                } catch (Exception ignored) {}
                return ResponseEntity.ok(updatedVendor);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to update vendor: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/vendors/{id}")
    public ResponseEntity<?> deleteVendor(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return vendorRepository.findById(id).map(v -> {
            try {
                String oldVal = v.getName() + " (" + (v.getMobileNumber() != null ? v.getMobileNumber() : "No Contact") + ")";
                vendorRepository.delete(v);
                try {
                    auditService.logAction(roleHeader, "Vendor", id, "DELETED", oldVal, null, "Deleted vendor " + v.getName());
                } catch (Exception ignored) {}
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to delete vendor from database: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Inventory ---
    @GetMapping("/inventory")
    public List<InventoryItem> getAllInventoryItems() { return inventoryItemRepository.findAll(); }
    
    @PostMapping("/inventory")
    public InventoryItem createInventoryItem(@RequestBody InventoryItem item, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) { 
        InventoryItem saved = inventoryItemRepository.save(item);
        try {
            String newVal = saved.getName() + " (Qty: " + saved.getQuantity() + ")";
            auditService.logAction(roleHeader, "Inventory", saved.getId(), "CREATED", null, newVal, "Created inventory item " + saved.getName());
        } catch (Exception ignored) {}
        return saved;
    }
    
    @PutMapping("/inventory/{id}")
    public ResponseEntity<InventoryItem> updateInventoryItem(@PathVariable Long id, @RequestBody InventoryItem itemDetails, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return inventoryItemRepository.findById(id).map(i -> {
            String oldVal = i.getName() + " (Qty: " + i.getQuantity() + ")";
            if (itemDetails.getQuantity() != null) {
                i.setQuantity(itemDetails.getQuantity());
            }
            if (itemDetails.getName() != null) {
                i.setName(itemDetails.getName());
            }
            InventoryItem saved = inventoryItemRepository.save(i);
            String newVal = saved.getName() + " (Qty: " + saved.getQuantity() + ")";
            try {
                auditService.logAction(roleHeader, "Inventory", saved.getId(), "EDITED", oldVal, newVal, "Updated inventory item " + saved.getName());
            } catch (Exception ignored) {}
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/inventory/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return inventoryItemRepository.findById(id).map(i -> {
            String oldVal = i.getName() + " (Qty: " + i.getQuantity() + ")";
            inventoryItemRepository.delete(i);
            try {
                auditService.logAction(roleHeader, "Inventory", id, "DELETED", oldVal, null, "Deleted inventory item " + i.getName());
            } catch (Exception ignored) {}
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
