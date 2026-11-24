package com.tms.backend.controller;

import com.tms.backend.model.Expense;
import com.tms.backend.model.Trip;
import com.tms.backend.model.Vehicle;
import com.tms.backend.repository.ExpenseRepository;
import com.tms.backend.repository.TripRepository;
import com.tms.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fastag")
@CrossOrigin(originPatterns = "*")
public class FastagController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    /**
     * Webhook endpoint to receive toll deductions from FASTag provider (e.g. ICICI / Paytm API)
     * Body expects: { "vehicleNumber": "MH12AB1234", "amount": 250, "plazaName": "Pune-Mumbai Expressway" }
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> receiveTollWebhook(@RequestBody Map<String, Object> payload) {
        String vehicleNumber = (String) payload.get("vehicleNumber");
        Number amountNumber = (Number) payload.get("amount");
        String plazaName = (String) payload.get("plazaName");

        if (vehicleNumber == null || amountNumber == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing vehicleNumber or amount"));
        }

        // 1. Find Vehicle
        Vehicle vehicle = vehicleRepository.findByRegistrationNumber(vehicleNumber);
        if (vehicle == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vehicle not found: " + vehicleNumber));
        }

        // 2. Check if Vehicle is currently on an active trip
        List<Trip> activeTrips = tripRepository.findByVehicleAndStatus(vehicle, "In Transit");
        Trip currentTrip = activeTrips.isEmpty() ? null : activeTrips.get(0);

        // 3. Create Expense automatically
        Expense tollExpense = new Expense();
        tollExpense.setDate(LocalDate.now());
        tollExpense.setTitle("FASTag Toll: " + (plazaName != null ? plazaName : "Unknown Plaza"));
        tollExpense.setCategory("Toll");
        tollExpense.setAmount(BigDecimal.valueOf(amountNumber.doubleValue()));
        tollExpense.setVehicle(vehicle);
        
        // If there's an active trip, attach it so it reduces the trip's profit automatically!
        if (currentTrip != null) {
            tollExpense.setTrip(currentTrip);
        }

        expenseRepository.save(tollExpense);

        return ResponseEntity.ok(Map.of(
            "message", "FASTag Toll recorded successfully",
            "expenseId", tollExpense.getId(),
            "attachedToTrip", currentTrip != null ? currentTrip.getTripNumber() : "None"
        ));
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getFastagFeed() {
        List<Expense> tollExpenses = expenseRepository.findAll().stream()
                .filter(e -> "Toll".equalsIgnoreCase(e.getCategory()) || (e.getTitle() != null && e.getTitle().toLowerCase().contains("fastag")))
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .toList();

        List<Map<String, Object>> feed = tollExpenses.stream().map(e -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", e.getId());
            map.put("date", e.getDate() != null ? e.getDate().toString() : "");
            map.put("title", e.getTitle());
            map.put("amount", e.getAmount());
            map.put("vehicleNumber", e.getVehicle() != null ? e.getVehicle().getRegistrationNumber() : "N/A");
            map.put("vehicleName", e.getVehicle() != null ? e.getVehicle().getName() : "Unknown");
            map.put("tripNumber", e.getTrip() != null ? e.getTrip().getTripNumber() : "N/A");
            map.put("route", e.getTrip() != null ? e.getTrip().getRoute() : "N/A");
            map.put("status", "SUCCESS");
            return map;
        }).toList();

        return ResponseEntity.ok(feed);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getFastagSummary() {
        List<Expense> tollExpenses = expenseRepository.findAll().stream()
                .filter(e -> "Toll".equalsIgnoreCase(e.getCategory()) || (e.getTitle() != null && e.getTitle().toLowerCase().contains("fastag")))
                .toList();

        double totalAmount = tollExpenses.stream()
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount().doubleValue() : 0.0)
                .sum();

        long totalTransactions = tollExpenses.size();
        long linkedTripsCount = tollExpenses.stream().filter(e -> e.getTrip() != null).count();

        return ResponseEntity.ok(Map.of(
            "totalTollSpent", totalAmount,
            "totalTransactions", totalTransactions,
            "linkedTripsCount", linkedTripsCount
        ));
    }
}
