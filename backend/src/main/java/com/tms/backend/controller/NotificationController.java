package com.tms.backend.controller;

import com.tms.backend.entity.Notification;
import com.tms.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.tms.backend.repository.VehicleRepository vehicleRepository;

    @Autowired
    private com.tms.backend.repository.DriverRepository driverRepository;

    @GetMapping
    public List<Notification> getAllNotifications() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        List<Notification> all = notificationRepository.findAll();
        
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"))) {
            // Drivers should only see notifications specifically mentioning their username/phone, or generic driver alerts
            // They should NOT see HR/Salary alerts for all employees
            String username = auth.getName();
            return all.stream()
                      .filter(n -> (n.getMessage() != null && n.getMessage().contains(username)) || (n.getTitle() != null && (n.getTitle().contains("Assigned") || n.getTitle().contains("Your Trip"))))
                      .toList();
        }
        
        return all;
    }

    @GetMapping("/centralized")
    public ResponseEntity<java.util.Map<String, Object>> getCentralizedAlerts() {
        List<Notification> unreadNotifs = getAllNotifications().stream()
            .filter(n -> !n.isRead())
            .toList();

        List<java.util.Map<String, Object>> docAlerts = calculateExpiringDocuments();

        List<java.util.Map<String, Object>> allAlerts = new java.util.ArrayList<>();
        
        // Add document alerts
        allAlerts.addAll(docAlerts);

        // Add system notifications
        for (Notification n : unreadNotifs) {
            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", "sys-" + n.getId());
            item.put("dbId", n.getId());
            item.put("title", n.getTitle());
            item.put("message", n.getMessage());
            item.put("category", "SYSTEM");
            item.put("type", n.getTitle() != null && n.getTitle().toLowerCase().contains("alert") ? "danger" : "warning");
            item.put("date", n.getDate() != null ? n.getDate().toString() : java.time.LocalDateTime.now().toString());
            item.put("read", n.isRead());
            if (n.getTitle() != null && n.getTitle().toLowerCase().contains("salary")) {
                item.put("targetUrl", "/payroll");
            } else if (n.getTitle() != null && n.getTitle().toLowerCase().contains("trip")) {
                item.put("targetUrl", "/trips");
            } else {
                item.put("targetUrl", "/notifications");
            }
            allAlerts.add(item);
        }

        int totalCount = allAlerts.size();

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("totalAlerts", totalCount);
        response.put("unreadCount", totalCount);
        response.put("documentAlertsCount", docAlerts.size());
        response.put("systemAlertsCount", unreadNotifs.size());
        response.put("alerts", allAlerts);
        response.put("documentAlerts", docAlerts);
        response.put("systemAlerts", unreadNotifs);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/expiring-documents")
    public List<java.util.Map<String, Object>> getExpiringDocuments() {
        return calculateExpiringDocuments();
    }

    public List<java.util.Map<String, Object>> calculateExpiringDocuments() {
        List<java.util.Map<String, Object>> alerts = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate warningThreshold = today.plusDays(30);

        try {
            // Vehicles: Insurance, PUC, Fitness, Permit
            List<com.tms.backend.model.Vehicle> vehicles = vehicleRepository.findAll();
            for (com.tms.backend.model.Vehicle v : vehicles) {
                String reg = v.getRegistrationNumber() != null ? v.getRegistrationNumber() : "Vehicle #" + v.getId();
                checkAndAddDocAlert(alerts, "PUC", reg, v.getPucExpiry(), today, warningThreshold, "/vehicles");
                checkAndAddDocAlert(alerts, "Insurance", reg, v.getInsuranceExpiry(), today, warningThreshold, "/vehicles");
                checkAndAddDocAlert(alerts, "Fitness", reg, v.getFitnessExpiry(), today, warningThreshold, "/vehicles");
                checkAndAddDocAlert(alerts, "Permit", reg, v.getPermitExpiry(), today, warningThreshold, "/vehicles");
            }

            // Drivers: License
            List<com.tms.backend.model.Driver> drivers = driverRepository.findAll();
            for (com.tms.backend.model.Driver d : drivers) {
                String name = d.getName() != null ? d.getName() : "Driver #" + d.getId();
                checkAndAddDocAlert(alerts, "Driving License", name, d.getLicenseExpiry(), today, warningThreshold, "/drivers");
            }
        } catch (Exception e) {
            System.err.println("Error calculating expiring documents: " + e.getMessage());
        }

        return alerts;
    }

    private void checkAndAddDocAlert(List<java.util.Map<String, Object>> alerts, String docType, String entityName, java.time.LocalDate expiryDate, java.time.LocalDate today, java.time.LocalDate warningThreshold, String targetUrl) {
        if (expiryDate == null) return;
        if (expiryDate.isBefore(today)) {
            long daysExpired = java.time.temporal.ChronoUnit.DAYS.between(expiryDate, today);
            java.util.Map<String, Object> alert = new java.util.HashMap<>();
            alert.put("id", "doc-" + entityName.replaceAll("\\s+", "-") + "-" + docType.toLowerCase().replaceAll("\\s+", "-"));
            alert.put("title", docType + " Expired (" + entityName + ")");
            alert.put("message", docType + " for " + entityName + " expired " + daysExpired + " days ago (" + expiryDate + ")!");
            alert.put("type", "danger");
            alert.put("category", "DOCUMENT");
            alert.put("date", expiryDate.atStartOfDay().toString());
            alert.put("targetUrl", targetUrl);
            alert.put("read", false);
            alerts.add(alert);
        } else if (!expiryDate.isAfter(warningThreshold)) {
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, expiryDate);
            java.util.Map<String, Object> alert = new java.util.HashMap<>();
            alert.put("id", "doc-" + entityName.replaceAll("\\s+", "-") + "-" + docType.toLowerCase().replaceAll("\\s+", "-"));
            alert.put("title", docType + " Expiring Soon (" + entityName + ")");
            alert.put("message", docType + " for " + entityName + " expires in " + daysLeft + " days (" + expiryDate + ").");
            alert.put("type", daysLeft <= 7 ? "danger" : "warning");
            alert.put("category", "DOCUMENT");
            alert.put("date", expiryDate.atStartOfDay().toString());
            alert.put("targetUrl", targetUrl);
            alert.put("read", false);
            alerts.add(alert);
        }
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        if (notification.getDate() == null) {
            notification.setDate(LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setRead(true);
            return ResponseEntity.ok(notificationRepository.save(notification));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        List<Notification> all = notificationRepository.findAll();
        for (Notification n : all) {
            n.setRead(true);
        }
        notificationRepository.saveAll(all);
        return ResponseEntity.ok(java.util.Map.of("message", "All notifications marked as read"));
    }
}
