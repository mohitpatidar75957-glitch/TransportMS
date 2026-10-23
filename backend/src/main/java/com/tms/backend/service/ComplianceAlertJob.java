package com.tms.backend.service;

import com.tms.backend.model.Vehicle;
import com.tms.backend.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.tms.backend.repository.DriverRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ComplianceAlertJob {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    // Optional: Autowire the WhatsApp service if it exists to actually send the notification
    // @Autowired
    // private WhatsAppService whatsAppService;

    // Run every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkDocumentExpiries() {
        System.out.println("Running Compliance Alert Job...");
        
        List<Vehicle> vehicles = vehicleRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Vehicle vehicle : vehicles) {
            String ins = vehicle.getInsuranceExpiry() != null ? vehicle.getInsuranceExpiry().toString() : null;
            String puc = vehicle.getPucExpiry() != null ? vehicle.getPucExpiry().toString() : null;
            String per = vehicle.getPermitExpiry() != null ? vehicle.getPermitExpiry().toString() : null;
            String fit = vehicle.getFitnessExpiry() != null ? vehicle.getFitnessExpiry().toString() : null;
            checkAndAlertString(vehicle.getRegistrationNumber(), "Insurance", ins, today);
            checkAndAlertString(vehicle.getRegistrationNumber(), "PUC", puc, today);
            checkAndAlertString(vehicle.getRegistrationNumber(), "Permit", per, today);
            checkAndAlertString(vehicle.getRegistrationNumber(), "Fitness", fit, today);
        }

        List<com.tms.backend.model.Driver> drivers = driverRepository.findAll();
        for (com.tms.backend.model.Driver driver : drivers) {
            String expiryStr = driver.getLicenseExpiry() != null ? driver.getLicenseExpiry().toString() : null;
            checkAndAlertString(driver.getName() + " (Driver)", "License", expiryStr, today);
        }
    }

    private void checkAndAlertString(String entityName, String documentType, String expiryDateStr, LocalDate today) {
        if (expiryDateStr == null || expiryDateStr.trim().isEmpty()) return;
        try {
            LocalDate expiryDate = LocalDate.parse(expiryDateStr);
            long daysBetween = ChronoUnit.DAYS.between(today, expiryDate);

            if (daysBetween == 30 || daysBetween == 15 || daysBetween == 3) {
                String message = String.format("ALERT: %s %s will expire in %d days (on %s).",
                        entityName, documentType, daysBetween, expiryDate);
                        
                System.out.println(message);
            } else if (daysBetween < 0) {
                System.out.println("URGENT: " + entityName + " " + documentType + " has EXPIRED.");
            }
        } catch (Exception e) {
            System.out.println("Failed to parse date for " + entityName);
        }
    }
}
