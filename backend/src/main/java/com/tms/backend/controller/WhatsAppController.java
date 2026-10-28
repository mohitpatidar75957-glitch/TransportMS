package com.tms.backend.controller;

import com.tms.backend.entity.WhatsAppLog;
import com.tms.backend.entity.WhatsAppTemplate;
import com.tms.backend.service.WhatsAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/whatsapp")
@CrossOrigin(originPatterns = "*")
public class WhatsAppController {
    
    private final WhatsAppService whatsappService;
    private final com.tms.backend.service.InvoiceReminderScheduler reminderScheduler;

    public WhatsAppController(WhatsAppService whatsappService, com.tms.backend.service.InvoiceReminderScheduler reminderScheduler) {
        this.whatsappService = whatsappService;
        this.reminderScheduler = reminderScheduler;
    }

    @GetMapping("/templates")
    public ResponseEntity<List<WhatsAppTemplate>> getTemplates() {
        return ResponseEntity.ok(whatsappService.getAllTemplates());
    }

    @PostMapping("/templates")
    public ResponseEntity<WhatsAppTemplate> createTemplate(@RequestBody WhatsAppTemplate template) {
        return ResponseEntity.ok(whatsappService.createTemplate(template));
    }

    @PutMapping("/templates/{id}/toggle")
    public ResponseEntity<WhatsAppTemplate> toggleTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(whatsappService.toggleTemplate(id));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<WhatsAppLog>> getLogs() {
        return ResponseEntity.ok(whatsappService.getLogs());
    }

    @PostMapping("/simulate")
    public ResponseEntity<WhatsAppLog> simulateMessage(@RequestParam String recipient, @RequestParam String template) {
        return ResponseEntity.ok(whatsappService.simulateSendMessage(recipient, template));
    }

    @PostMapping("/run-due-reminders")
    public ResponseEntity<?> runDueDateReminders() {
        return ResponseEntity.ok(reminderScheduler.runDailyDueDateReminders());
    }
}
