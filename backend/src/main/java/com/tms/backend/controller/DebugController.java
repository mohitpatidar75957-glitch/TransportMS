package com.tms.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

@RestController
public class DebugController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @GetMapping("/api/debug-query")
    public Object debugQuery(String query) {
        try {
            return jdbcTemplate.queryForList(query != null ? query : "SELECT * FROM trips LIMIT 1");
        } catch (Exception e) {
            return Map.of("error", e.getMessage(), "cause", e.getCause() != null ? e.getCause().getMessage() : "");
        }
    }
}
