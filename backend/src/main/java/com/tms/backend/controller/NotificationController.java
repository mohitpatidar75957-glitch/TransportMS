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

    @GetMapping
    public List<Notification> getAllNotifications() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        List<Notification> all = notificationRepository.findAll();
        
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DRIVER"))) {
            // Drivers should only see notifications specifically mentioning their username/phone, or generic driver alerts
            // They should NOT see HR/Salary alerts for all employees
            String username = auth.getName();
            return all.stream()
                      .filter(n -> n.getMessage().contains(username) || n.getTitle().contains("Assigned") || n.getTitle().contains("Your Trip"))
                      .toList();
        }
        
        return all;
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
}
