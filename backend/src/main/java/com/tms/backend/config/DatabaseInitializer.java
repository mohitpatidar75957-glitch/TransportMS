package com.tms.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        String[] vehicleCols = {
            "chassis_number", "engine_number", "model", "type", "capacity",
            "status", "mileage", "fuel_type", "notes", "insurance_expiry",
            "puc_expiry", "permit_expiry", "fitness_expiry", "tenant_id"
        };
        for (String col : vehicleCols) {
            try {
                jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN " + col + " DROP NOT NULL");
            } catch (Exception ignored) {}
        }

        String[] driverCols = {
            "license_expiry", "aadhar_number", "pan_number", "phone",
            "address", "joined_date", "tenant_id", "salary_type", "salary_amount", "alt_phone", "blood_group"
        };
        for (String col : driverCols) {
            try {
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN " + col + " DROP NOT NULL");
            } catch (Exception ignored) {}
        }

        try {
            jdbcTemplate.execute("UPDATE vehicles SET ownership = 'RK' WHERE ownership IN ('Owned', 'Leased', 'Unknown') OR ownership IS NULL");
        } catch (Exception ignored) {}
    }
}
