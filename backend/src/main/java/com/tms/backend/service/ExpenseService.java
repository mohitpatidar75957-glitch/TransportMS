package com.tms.backend.service;

import com.tms.backend.entity.Notification;
import com.tms.backend.model.Expense;
import com.tms.backend.model.FuelRecord;
import com.tms.backend.model.Vehicle;
import com.tms.backend.repository.ExpenseRepository;
import com.tms.backend.repository.NotificationRepository;
import com.tms.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Category-specific baseline average limits for anomaly detection (INR).
     * If an expense exceeds these rules or previous 30-day vehicle average by 2x, it triggers a Red Flag.
     */
    private static final Map<String, Double> CATEGORY_ALERT_THRESHOLDS = new HashMap<>();
    static {
        CATEGORY_ALERT_THRESHOLDS.put("TOLL", 5000.0);           // Normal single toll voucher rarely exceeds 5,000
        CATEGORY_ALERT_THRESHOLDS.put("DRIVER ALLOWANCE", 4000.0); // Daily bhatta rarely exceeds 4,000
        CATEGORY_ALERT_THRESHOLDS.put("RTO", 15000.0);           // RTO / Challan alert threshold
        CATEGORY_ALERT_THRESHOLDS.put("MAINTENANCE", 35000.0);   // Routine repair threshold
        CATEGORY_ALERT_THRESHOLDS.put("FUEL", 25000.0);          // Single fuel filling threshold
        CATEGORY_ALERT_THRESHOLDS.put("OFFICE", 20000.0);
    }

    @Autowired
    private com.tms.backend.repository.TripRepository tripRepository;

    /**
     * Evaluates whether an expense is unusual or suspicious (Red Flag).
     */
    public Map<String, Object> checkExpenseAnomaly(String category, Double amount, Long vehicleId) {
        return checkExpenseAnomaly(category, amount, vehicleId, null);
    }

    public Map<String, Object> checkExpenseAnomaly(String category, Double amount, Long vehicleId, Long tripId) {
        Map<String, Object> result = new HashMap<>();
        result.put("isFlagged", false);
        result.put("reason", null);
        result.put("severity", "LOW");

        if (amount == null || amount <= 0) {
            return result;
        }

        String catKey = category != null ? category.trim().toUpperCase() : "GENERAL";
        Double threshold = CATEGORY_ALERT_THRESHOLDS.getOrDefault(catKey, 25000.0);

        // Check 1: Route Distance vs Fuel / Expense Check (Trip specific)
        if (tripId != null) {
            com.tms.backend.model.Trip trip = tripRepository.findById(tripId).orElse(null);
            if (trip != null) {
                Double distance = trip.getDistance();
                if (distance != null && distance > 0) {
                    if ("FUEL".equalsIgnoreCase(catKey)) {
                        // Truck avg is around 3.5 to 5.0 KM/L, diesel price ~ 92/L
                        // Max expected fuel cost ~ (distance / 3.0) * 95
                        double maxExpectedFuelCost = (distance / 3.0) * 95.0;
                        if (amount > Math.max(1500.0, maxExpectedFuelCost * 1.4)) {
                            result.put("isFlagged", true);
                            result.put("severity", "HIGH");
                            result.put("reason", String.format("Short Route Abnormal Diesel Spike: Trip distance is only %.0f km (Route: %s). Max expected fuel is ~₹%.0f, but ₹%,.0f was entered (Abnormal Consumption).",
                                    distance, trip.getRoute() != null ? trip.getRoute() : "Local", maxExpectedFuelCost, amount));
                            return result;
                        }
                    } else if ("TOLL".equalsIgnoreCase(catKey)) {
                        // Toll normally ₹2-3 per KM
                        double maxExpectedToll = Math.max(800.0, distance * 3.5);
                        if (amount > (maxExpectedToll * 1.5)) {
                            result.put("isFlagged", true);
                            result.put("severity", "MEDIUM");
                            result.put("reason", String.format("Unusual High Toll: For %.0f km route, normal toll is under ₹%.0f, but ₹%,.0f was entered.",
                                    distance, maxExpectedToll, amount));
                            return result;
                        }
                    }
                }
            }
        }

        // Check 2: Absolute category threshold spike
        if (amount >= threshold) {
            result.put("isFlagged", true);
            result.put("severity", amount >= (threshold * 1.5) ? "HIGH" : "MEDIUM");
            result.put("reason", String.format("Unusual Expense Spike: ₹%,.0f exceeds normal %s threshold limit of ₹%,.0f.", 
                    amount, category, threshold));
            return result;
        }

        // Check 3: Vehicle-specific historical average spike (> 2.0x of past average)
        if (vehicleId != null) {
            List<Expense> pastExpenses = expenseRepository.findAll().stream()
                    .filter(e -> e.getVehicle() != null && vehicleId.equals(e.getVehicle().getId()))
                    .filter(e -> catKey.equalsIgnoreCase(e.getCategory()))
                    .filter(e -> e.getAmount() != null)
                    .toList();

            if (pastExpenses.size() >= 3) {
                double avg = pastExpenses.stream()
                        .mapToDouble(e -> e.getAmount().doubleValue())
                        .average()
                        .orElse(0.0);

                if (avg > 0 && amount > (avg * 2.0)) {
                    result.put("isFlagged", true);
                    result.put("severity", "MEDIUM");
                    result.put("reason", String.format("Unusual Spike: ₹%,.0f is more than double of vehicle's average %s cost (₹%,.0f).",
                            amount, category, avg));
                    return result;
                }
            }
        }

        return result;
    }

    /**
     * Intercepts and flags expense before saving, and creates in-app notification if flagged.
     */
    public Expense processAndSaveExpense(Expense expense) {
        if (expense.getAmount() != null) {
            Long vehicleId = expense.getVehicle() != null ? expense.getVehicle().getId() : null;
            Long tripId = expense.getTrip() != null ? expense.getTrip().getId() : null;
            Map<String, Object> check = checkExpenseAnomaly(expense.getCategory(), expense.getAmount().doubleValue(), vehicleId, tripId);

            if (Boolean.TRUE.equals(check.get("isFlagged"))) {
                expense.setIsFlagged(true);
                expense.setFlagReason((String) check.get("reason"));

                // Create System Notification
                Notification notif = new Notification();
                notif.setTitle("⚠️ Unusual Expense Alert (" + expense.getCategory() + ")");
                String vehInfo = expense.getVehicle() != null && expense.getVehicle().getRegistrationNumber() != null 
                        ? " on vehicle " + expense.getVehicle().getRegistrationNumber() 
                        : "";
                notif.setMessage(String.format("Unusual expense of ₹%s logged%s. Reason: %s", 
                        expense.getAmount(), vehInfo, expense.getFlagReason()));
                notif.setDate(LocalDateTime.now());
                notif.setRead(false);
                notificationRepository.save(notif);
            } else {
                expense.setIsFlagged(false);
            }
        }

        return expenseRepository.save(expense);
    }
}
