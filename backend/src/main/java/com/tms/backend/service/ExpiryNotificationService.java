package com.tms.backend.service;

import com.tms.backend.entity.Notification;
import com.tms.backend.model.Driver;
import com.tms.backend.model.Vehicle;
import com.tms.backend.repository.DriverRepository;
import com.tms.backend.repository.NotificationRepository;
import com.tms.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ExpiryNotificationService {

    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private DriverRepository driverRepository;
    @Autowired private NotificationRepository notificationRepository;

    // Roz subah 8 baje chalega, aur ek baar startup par bhi
    @Scheduled(cron = "0 0 8 * * ?")
    @EventListener(ApplicationReadyEvent.class)
    public void checkExpiries() {
        checkVehicleExpiries();
        checkDriverExpiries();
    }

    private void checkVehicleExpiries() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        for (Vehicle v : vehicles) {
            checkAndNotify(v.getInsuranceExpiry(), "Insurance", v.getRegistrationNumber());
            checkAndNotify(v.getPermitExpiry(),    "Permit",    v.getRegistrationNumber());
            checkAndNotify(v.getPucExpiry(),       "PUC",       v.getRegistrationNumber());
            checkAndNotify(v.getFitnessExpiry(),   "Fitness",   v.getRegistrationNumber());
        }
    }

    private void checkDriverExpiries() {
        List<Driver> drivers = driverRepository.findAll();
        for (Driver d : drivers) {
            checkAndNotify(d.getLicenseExpiry(), "Driving License", d.getName());
        }
    }

    // Ab LocalDate direct accept karta hai — koi String parsing nahi
    private void checkAndNotify(LocalDate expiryDate, String docType, String entityName) {
        if (expiryDate == null) return;

        LocalDate today = LocalDate.now();
        long daysBetween = ChronoUnit.DAYS.between(today, expiryDate);

        if (daysBetween == 30 || daysBetween == 15 || daysBetween == 3 || daysBetween <= 0) {
            String title = docType + " Expiry Alert";
            String message;

            if (daysBetween < 0) {
                message = docType + " for " + entityName + " has EXPIRED " + Math.abs(daysBetween) + " days ago!";
            } else if (daysBetween == 0) {
                message = docType + " for " + entityName + " expires TODAY!";
            } else {
                message = docType + " for " + entityName + " is expiring in " + daysBetween +
                          " days (" + expiryDate + ").";
            }

            boolean alreadySent = notificationRepository.findAll().stream()
                    .anyMatch(n -> n.getTitle().equals(title)
                                && n.getMessage().equals(message)
                                && n.getDate().toLocalDate().equals(today));

            if (!alreadySent) {
                Notification notification = new Notification();
                notification.setTitle(title);
                notification.setMessage(message);
                notification.setDate(LocalDateTime.now());
                notification.setRead(false);
                notificationRepository.save(notification);
            }
        }
    }
}
