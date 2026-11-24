package com.tms.backend.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.tms.backend.model.Driver;
import com.tms.backend.model.Vehicle;
import com.tms.backend.model.Vendor;
import com.tms.backend.repository.DriverRepository;
import com.tms.backend.repository.VehicleRepository;
import com.tms.backend.repository.VendorRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(VendorRepository vendorRepo, VehicleRepository vehicleRepo, DriverRepository driverRepo) {
        return args -> {
            // Seed default Fuel Pump Vendors
            if (vendorRepo.count() == 0) {
                String[] pumps = {
                    "Indian Oil Pump", 
                    "HP Petrol Pump",
                    "BPCL Fuel Station",
                    "Shell Fuel Station",
                    "Reliance Petrol Pump",
                    "Nayara Energy Pump"
                };
                for (String p : pumps) {
                    Vendor v = new Vendor();
                    v.setName(p);
                    v.setServices(java.util.List.of("Fuel"));
                    v.setStatus("Active");
                    v.setBalance(BigDecimal.ZERO);
                    v.setTenantId(1L);
                    vendorRepo.save(v);
                }
            }

            // Seed default vehicles if Supabase has 0
            if (vehicleRepo.count() == 0) {
                String[][] vData = {
                    {"MH 12 AB 1234", "Tata Prima 4028", "Truck", "25 Ton", "Active", "RK", "Diesel"},
                    {"DL 01 XY 9876", "Ashok Leyland 3118", "Truck", "30 Ton", "Active", "RK", "Diesel"},
                    {"GJ 03 KL 4567", "BharatBenz 2823C", "Truck", "28 Ton", "Active", "RK", "Diesel"},
                    {"MP 09 CD 7890", "Eicher Pro 6028", "Truck", "20 Ton", "In Maintenance", "RK", "Diesel"}
                };
                for (String[] row : vData) {
                    Vehicle v = new Vehicle();
                    v.setRegistrationNumber(row[0]);
                    v.setName(row[1]);
                    v.setType(row[2]);
                    v.setCapacity(row[3]);
                    v.setStatus(row[4]);
                    v.setOwnership(row[5]);
                    v.setFuelType(row[6]);
                    v.setTenantId(1L);
                    vehicleRepo.save(v);
                }
            }

            // Seed default drivers if Supabase has 0
            if (driverRepo.count() == 0) {
                String[][] dData = {
                    {"Ramesh", "9988776655", "DL-MH-2022-001", "Available"},
                    {"Suresh", "9988776656", "DL-DL-2021-002", "Available"},
                    {"Mukesh", "9988776657", "DL-GJ-2020-003", "Available"},
                    {"Dinesh", "9988776658", "DL-MP-2023-004", "On Trip"}
                };
                long uId = 9;
                for (String[] row : dData) {
                    Driver d = new Driver();
                    d.setName(row[0]);
                    d.setPhone(row[1]);
                    d.setLicenseNumber(row[2]);
                    d.setStatus(row[3]);
                    d.setUserId(uId++);
                    d.setTenantId(1L);
                    driverRepo.save(d);
                }
            }
        };
    }
}

