package com.tms.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.tms.backend.model.Order;
import com.tms.backend.repository.OrderRepository;
import com.tms.backend.service.AuditService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        // Check if any legacy order numbers exist and clean them up
        for (Order o : orders) {
            if (o.getOrderNumber() != null && (o.getOrderNumber().startsWith("ORD-TRP-") || o.getOrderNumber().matches("ORD-\\d{10,}"))) {
                String cleanNum = String.format("ORD-%04d", o.getId() != null ? o.getId() : 1);
                o.setOrderNumber(cleanNum);
                try {
                    orderRepository.save(o);
                } catch (Exception ignored) {}
            }
        }
        return orders;
    }

    @PostMapping
    public synchronized Order createOrder(@RequestBody Order order, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        if (order.getOrderNumber() == null || order.getOrderNumber().trim().isEmpty() || order.getOrderNumber().startsWith("ORD-TRP-") || order.getOrderNumber().matches("ORD-\\d{10,}")) {
            order.setOrderNumber(generateNextOrderNumber());
        }
        if (order.getStatus() == null || order.getStatus().trim().isEmpty()) {
            order.setStatus("PENDING");
        }
        if (order.getExpectedDate() == null) {
            order.setExpectedDate(java.time.LocalDate.now().plusDays(2));
        }
        if (order.getTenantId() == null) {
            Long currentTenant = com.tms.backend.config.TenantContext.getCurrentTenant();
            order.setTenantId(currentTenant != null ? currentTenant : 1L);
        }
        Order saved = orderRepository.save(order);
        String newVal = saved.getCustomerName() + " (" + (saved.getCargoDetails() != null ? saved.getCargoDetails() : "") + ", " + saved.getStatus() + ")";
        try {
            auditService.logAction(roleHeader, "Order", saved.getId(), "CREATED", null, newVal, "Created order " + saved.getOrderNumber() + " for " + saved.getCustomerName());
        } catch (Exception ignored) {}
        return saved;
    }

    /**
     * Generates human-readable sequential Order IDs in the format ORD-0001, ORD-0002, etc.
     */
    private String generateNextOrderNumber() {
        long nextSeq = 1;
        List<Order> allOrders = orderRepository.findAll();
        for (Order o : allOrders) {
            if (o.getOrderNumber() != null && o.getOrderNumber().startsWith("ORD-")) {
                try {
                    String numericPart = o.getOrderNumber().replace("ORD-", "").trim();
                    // If it's a short sequence number (up to 6 digits)
                    if (numericPart.matches("\\d{1,6}")) {
                        long val = Long.parseLong(numericPart);
                        if (val >= nextSeq) {
                            nextSeq = val + 1;
                        }
                    }
                } catch (Exception ignored) {}
            }
        }
        return String.format("ORD-%04d", nextSeq);
    }

    @PutMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody Order updated, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return orderRepository.findById(id).map(existing -> {
            String oldVal = existing.getCustomerName() + " (" + (existing.getCargoDetails() != null ? existing.getCargoDetails() : "") + ", " + existing.getStatus() + ")";
            if (updated.getCustomerName() != null) existing.setCustomerName(updated.getCustomerName());
            if (updated.getCargoDetails() != null) existing.setCargoDetails(updated.getCargoDetails());
            if (updated.getPickupLocation() != null) existing.setPickupLocation(updated.getPickupLocation());
            if (updated.getDropLocation() != null) existing.setDropLocation(updated.getDropLocation());
            if (updated.getWeight() != null) existing.setWeight(updated.getWeight());
            if (updated.getAmount() != null) existing.setAmount(updated.getAmount());
            if (updated.getExpectedDate() != null) existing.setExpectedDate(updated.getExpectedDate());
            if (updated.getStatus() != null) existing.setStatus(updated.getStatus());

            Order saved = orderRepository.save(existing);
            String newVal = saved.getCustomerName() + " (" + (saved.getCargoDetails() != null ? saved.getCargoDetails() : "") + ", " + saved.getStatus() + ")";
            try {
                auditService.logAction(roleHeader, "Order", saved.getId(), "EDITED", oldVal, newVal, "Updated order " + saved.getOrderNumber());
            } catch (Exception ignored) {}
            return org.springframework.http.ResponseEntity.ok(saved);
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteOrder(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return orderRepository.findById(id).map(order -> {
            String oldVal = order.getOrderNumber() + " - " + order.getCustomerName() + " (" + order.getStatus() + ")";
            orderRepository.delete(order);
            try {
                auditService.logAction(roleHeader, "Order", id, "DELETED", oldVal, null, "Deleted order " + order.getOrderNumber());
            } catch (Exception ignored) {}
            return org.springframework.http.ResponseEntity.ok().build();
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }
}

