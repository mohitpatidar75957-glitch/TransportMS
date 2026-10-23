package com.tms.backend.controller;

import com.tms.backend.model.Trip;
import com.tms.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/public/tracking")
@CrossOrigin(originPatterns = "*")
public class PublicTrackingController {

    @Autowired
    private TripRepository tripRepository;

    @GetMapping("/{trackingId}")
    public ResponseEntity<?> trackTrip(@PathVariable String trackingId) {
        // Find trip by trackingId
        Optional<Trip> tripOpt = tripRepository.findAll().stream()
                .filter(t -> trackingId.equals(t.getTrackingLink()))
                .findFirst();

        if (tripOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Trip trip = tripOpt.get();

        // 1. Simulate Live Location (e.g. midway between pickup and delivery)
        String currentLocation = "Near " + (trip.getPickupAddress() != null ? trip.getPickupAddress().split(",")[0] : "Origin");
        if ("In Transit".equalsIgnoreCase(trip.getStatus())) {
            currentLocation = "In Transit (Highway 44)";
        } else if ("Completed".equalsIgnoreCase(trip.getStatus()) || "Delivered".equalsIgnoreCase(trip.getStatus())) {
            currentLocation = trip.getDeliveryAddress() != null ? trip.getDeliveryAddress() : "Destination";
        }

        // 2. Simulate Weather from Open-Meteo logic (For now, random simulated weather warnings)
        String[] weatherConditions = {"Clear", "Heavy Rain (Monsoon)", "Foggy (Low Visibility)", "Clear", "Clear"};
        String currentWeather = weatherConditions[new Random().nextInt(weatherConditions.length)];
        
        // 3. Simulate Traffic / Delay from TomTom logic
        int delayHours = 0;
        String delayReason = "";
        
        if (currentWeather.contains("Rain")) {
            delayHours = 3;
            delayReason = "Delayed due to heavy rain on route.";
        } else if (currentWeather.contains("Fog")) {
            delayHours = 2;
            delayReason = "Delayed due to low visibility.";
        } else if (new Random().nextBoolean()) {
            delayHours = 1;
            delayReason = "Minor traffic congestion near checkpoint.";
        }

        // Response Data for Sender/Receiver
        Map<String, Object> response = new HashMap<>();
        response.put("tripNumber", trip.getTripNumber());
        response.put("status", trip.getStatus());
        response.put("pickup", trip.getPickupAddress());
        response.put("delivery", trip.getDeliveryAddress());
        response.put("dispatchDate", trip.getDispatchDate() != null ? trip.getDispatchDate().toString() : "Not dispatched yet");
        
        // Add Live Factors
        response.put("currentLocation", currentLocation);
        response.put("weatherCondition", currentWeather);
        response.put("delayHours", delayHours);
        response.put("delayReason", delayReason);
        
        // Expected Delivery
        if (trip.getExpectedDeliveryDate() != null) {
            LocalDateTime expected = trip.getExpectedDeliveryDate().atStartOfDay().plusHours(delayHours);
            response.put("expectedDelivery", expected.toString());
        } else {
            response.put("expectedDelivery", "To Be Calculated");
        }

        // Driver details (Partial masking for privacy or full depending on business logic)
        if (trip.getDriver() != null) {
            response.put("driverName", trip.getDriver().getName());
            response.put("driverPhone", trip.getDriver().getPhone());
        }
        if (trip.getVehicle() != null) {
            response.put("vehicleNo", trip.getVehicle().getRegistrationNumber());
        }

        return ResponseEntity.ok(response);
    }
}
