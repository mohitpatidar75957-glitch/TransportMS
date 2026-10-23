package com.tms.backend.controller;

import com.tms.backend.entity.GstInvoice;
import com.tms.backend.service.GstService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gst")
@CrossOrigin(origins = "*")
public class GstController {

    private final GstService gstService;

    public GstController(GstService gstService) {
        this.gstService = gstService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(gstService.getGstStats());
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<GstInvoice>> getAllInvoices() {
        return ResponseEntity.ok(gstService.getAllInvoices());
    }

    @PostMapping("/invoices")
    public ResponseEntity<GstInvoice> createInvoice(@RequestBody GstInvoice invoice) {
        return ResponseEntity.ok(gstService.saveInvoice(invoice));
    }

    @PutMapping("/invoices/{id}/status")
    public ResponseEntity<GstInvoice> updateInvoiceStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        GstInvoice updated = gstService.updateStatus(id, body.get("status"));
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        gstService.deleteInvoice(id);
        return ResponseEntity.ok().build();
    }
}
