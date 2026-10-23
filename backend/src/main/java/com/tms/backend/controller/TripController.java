package com.tms.backend.controller;

import com.tms.backend.model.Trip;
import com.tms.backend.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @PostMapping("/{id}/pod")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DRIVER')")
    public ResponseEntity<?> uploadPod(
            @PathVariable Long id, 
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "deliveryPayment", required = false) java.math.BigDecimal deliveryPayment,
            @RequestParam(value = "paymentMode", required = false) String paymentMode,
            @RequestParam(value = "remarks", required = false) String remarks) {
        try {
            Trip updatedTrip = tripService.uploadPod(id, file, deliveryPayment, paymentMode, remarks);
            return ResponseEntity.ok(updatedTrip);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload POD: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> closeTrip(@PathVariable Long id) {
        try {
            Trip closedTrip = tripService.closeTrip(id);
            return ResponseEntity.ok(closedTrip);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage()); // Returns the specific error message for frontend popup
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to close trip: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reconcile")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> reconcileTrip(@PathVariable Long id, @RequestBody java.util.Map<String, java.math.BigDecimal> payload) {
        try {
            Trip trip = tripService.reconcileTrip(id, payload.get("actualRevenue"), payload.get("reconciledCosts"));
            return ResponseEntity.ok(trip);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DRIVER')")
    public ResponseEntity<?> addNote(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            Trip trip = tripService.addNote(id, payload.get("note"));
            return ResponseEntity.ok(trip);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/auto-freight")
    public ResponseEntity<java.math.BigDecimal> getAutoFreight(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String vehicleType) {
        return ResponseEntity.ok(tripService.getAutoFreightRate(origin, destination, vehicleType));
    }

    @GetMapping("/route-ranking")
    public ResponseEntity<java.util.List<com.tms.backend.dto.RouteMarginDTO>> getRouteRanking(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String vehicleType) {
        return ResponseEntity.ok(tripService.getRankedRoutes(origin, destination, vehicleType));
    }

    @GetMapping("/estimate-delivery-time")
    public ResponseEntity<java.util.Map<String, Object>> getEstimatedDeliveryTime(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) Double distanceKm,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) Long vehicleId) {
        return ResponseEntity.ok(tripService.estimateDeliveryTime(origin, destination, distanceKm, startDate, vehicleId));
    }
}
