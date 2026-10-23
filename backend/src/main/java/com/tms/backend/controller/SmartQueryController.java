package com.tms.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/smart-query")
@CrossOrigin(origins = "*")
public class SmartQueryController {

    @Autowired private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> handleQuery(@RequestParam("q") String query) {
        String q = query.toLowerCase();
        Map<String, Object> response = new HashMap<>();

        // RULE 1: Route Profit/Loss
        if ((q.contains("route") || q.contains("routes") || q.contains("rasta")) &&
            (q.contains("loss") || q.contains("nuksan") || q.contains("money") || q.contains("profit"))) {

            response.put("type", "loss_routes");
            response.put("message", "Here are the trips currently running in loss (Expenses > Freight):");

            Long tenantId = com.tms.backend.config.TenantContext.getCurrentTenant();
            if (tenantId == null) tenantId = 1L;

            List<Map<String, Object>> data = new ArrayList<>();
            try {
                List<Map<String, Object>> trips = jdbcTemplate.queryForList(
                    "SELECT t.id, t.trip_number, t.route, t.freight_amount FROM trips t WHERE (t.tenant_id = ? OR t.tenant_id IS NULL)", tenantId
                );
                for (Map<String, Object> t : trips) {
                    Number freightNum = (Number) t.get("freight_amount");
                    if (freightNum == null) continue;
                    double freight = freightNum.doubleValue();
                    
                    Long tripId = ((Number) t.get("id")).longValue();
                    List<Map<String, Object>> expenses = jdbcTemplate.queryForList(
                        "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE trip_id = ? AND (tenant_id = ? OR tenant_id IS NULL)", tripId, tenantId
                    );
                    double totalExpenses = expenses.isEmpty() ? 0.0 : ((Number) expenses.get(0).get("total")).doubleValue();
                    
                    if (totalExpenses > freight) {
                        double loss = totalExpenses - freight;
                        String route = t.get("route") != null ? t.get("route").toString() : "Unknown";
                        data.add(Map.of(
                            "tripNo", t.get("trip_number") != null ? t.get("trip_number").toString() : "",
                            "route", route,
                            "loss", loss,
                            "freight", freight,
                            "expense", totalExpenses
                        ));
                    }
                }
            } catch (Exception e) {
                System.err.println("Error in loss_routes query: " + e.getMessage());
            }

            data.sort((a, b) -> Double.compare((Double) b.get("loss"), (Double) a.get("loss")));
            if (data.size() > 10) data = data.subList(0, 10);
            response.put("data", data);
            return ResponseEntity.ok(response);
        }

        // RULE 2: Unpaid Invoices
        if ((q.contains("unpaid") || q.contains("baki") || q.contains("due")) &&
            (q.contains("invoice") || q.contains("bill") || q.contains("paisa"))) {

            response.put("type", "unpaid_invoices");
            response.put("message", "Found unpaid invoices from clients:");

            Long tenantId = com.tms.backend.config.TenantContext.getCurrentTenant();
            if (tenantId == null) tenantId = 1L;

            List<Map<String, Object>> data = new ArrayList<>();
            double totalDue = 0.0;
            try {
                List<Map<String, Object>> invoices = jdbcTemplate.queryForList(
                    "SELECT client_name, status, balance_amount, total_amount FROM gst_invoices WHERE LOWER(status) != 'paid'"
                );
                for (Map<String, Object> inv : invoices) {
                    Number balance = (Number) inv.get("balance_amount");
                    Number total = (Number) inv.get("total_amount");
                    double due = balance != null ? balance.doubleValue() : (total != null ? total.doubleValue() : 0.0);
                    if (due > 0) {
                        String client = inv.get("client_name") != null ? inv.get("client_name").toString() : "Unknown";
                        data.add(Map.of("client", client, "amount", due));
                        totalDue += due;
                    }
                }
            } catch (Exception e) {
                System.err.println("Error in unpaid_invoices query: " + e.getMessage());
            }

            response.put("data", data);
            response.put("totalAmount", totalDue);
            return ResponseEntity.ok(response);
        }

        // RULE 3: Expiring Documents
        if ((q.contains("expire") || q.contains("expiring") || q.contains("document") || q.contains("vehicle"))) {

            response.put("type", "expiring_docs");
            response.put("message", "Vehicles with expired or expiring documents (within 30 days):");

            Long tenantId = com.tms.backend.config.TenantContext.getCurrentTenant();
            if (tenantId == null) tenantId = 1L;

            List<Map<String, Object>> data = new ArrayList<>();
            LocalDate today = LocalDate.now();
            LocalDate thirtyDays = today.plusDays(30);
            String todayStr = today.toString();
            String limitStr = thirtyDays.toString();

            try {
                // Multi-company data isolation: filter vehicles by current tenant
                String sql = "SELECT registration_number, insurance_expiry, puc_expiry, permit_expiry, fitness_expiry FROM vehicles WHERE (tenant_id = ? OR tenant_id IS NULL)";
                List<Map<String, Object>> vehicles = jdbcTemplate.queryForList(sql, tenantId);

                for (Map<String, Object> v : vehicles) {
                    String reg = v.get("registration_number") != null ? v.get("registration_number").toString() : "Unknown";
                    checkDocExpiry(data, reg, "Insurance", v.get("insurance_expiry"), todayStr, limitStr);
                    checkDocExpiry(data, reg, "PUC",       v.get("puc_expiry"),       todayStr, limitStr);
                    checkDocExpiry(data, reg, "Permit",    v.get("permit_expiry"),     todayStr, limitStr);
                    checkDocExpiry(data, reg, "Fitness",   v.get("fitness_expiry"),    todayStr, limitStr);
                }
            } catch (Exception e) {
                System.err.println("Error in expiring_docs query: " + e.getMessage());
            }

            response.put("data", data);
            return ResponseEntity.ok(response);
        }

        // FALLBACK
        response.put("type", "unknown");
        response.put("message", "Mujhe samajh nahi aaya. 'expiring documents', 'unpaid invoices', ya 'loss routes' type karein.");
        return ResponseEntity.ok(response);
    }

    /** Helper: check if a date string is on or before limitStr */
    private void checkDocExpiry(List<Map<String, Object>> data, String reg, String docType, Object expiryVal, String todayStr, String limitStr) {
        if (expiryVal == null) return;
        String expiry = expiryVal.toString(); // "2023-09-15" or LocalDate toString
        if (expiry.isBlank()) return;
        try {
            // Compare as strings (ISO format YYYY-MM-DD sorts correctly)
            if (expiry.compareTo(limitStr) <= 0) {
                String status = expiry.compareTo(todayStr) < 0 ? "EXPIRED" : "Expiring Soon";
                data.add(Map.of("vehicle", reg, "docType", docType, "expiry", expiry, "status", status));
            }
        } catch (Exception e) {
            // ignore unparseable
        }
    }
}
