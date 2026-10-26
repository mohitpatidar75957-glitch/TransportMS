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
        try {
            // Fix Supabase Postgres schema constraints
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN chassis_number DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN engine_number DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN model DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN type DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN capacity DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN status DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN mileage DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN fuel_type DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN notes DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN insurance_expiry DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN puc_expiry DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN permit_expiry DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN fitness_expiry DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE vehicles ALTER COLUMN tenant_id DROP NOT NULL");
            
            // Fix drivers constraints on Supabase
            try {
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN license_expiry DROP NOT NULL");
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN aadhar_number DROP NOT NULL");
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN pan_number DROP NOT NULL");
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN phone DROP NOT NULL");
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN address DROP NOT NULL");
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN joined_date DROP NOT NULL");
                jdbcTemplate.execute("ALTER TABLE drivers ALTER COLUMN tenant_id DROP NOT NULL");
            } catch (Exception ignored) {}

            jdbcTemplate.execute("UPDATE vehicles SET ownership = 'RK' WHERE ownership IN ('Owned', 'Leased', 'Unknown') OR ownership IS NULL");
            System.out.println("Updated existing mock vehicles to have owner 'RK'");
        } catch (Exception e) {
            System.err.println("Failed to run init query: " + e.getMessage());
        }
    }
}
