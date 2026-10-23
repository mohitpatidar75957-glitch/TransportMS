package com.tms.backend.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.tms.backend.model.Vendor;
import com.tms.backend.repository.VendorRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(VendorRepository vendorRepo) {
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
                    vendorRepo.save(v);
                }
            }
        };
    }
}

