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
            jdbcTemplate.execute("UPDATE vehicles SET ownership = 'RK' WHERE ownership IN ('Owned', 'Leased', 'Unknown') OR ownership IS NULL");
            System.out.println("Updated existing mock vehicles to have owner 'RK'");
        } catch (Exception e) {
            System.err.println("Failed to run init query: " + e.getMessage());
        }
    }
}
