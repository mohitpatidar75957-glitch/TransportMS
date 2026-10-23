package com.tms.backend.controller;

import com.tms.backend.model.Webhook;
import com.tms.backend.repository.WebhookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/webhooks")
@CrossOrigin(originPatterns = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class WebhookController {

    @Autowired
    private WebhookRepository webhookRepository;

    @Autowired
    private com.tms.backend.service.WebhookService webhookService;

    @PostMapping("/register")
    public ResponseEntity<Webhook> registerWebhook(@RequestBody Map<String, Object> payload) {
        String url = (String) payload.get("url");
        String eventType = (String) payload.getOrDefault("eventType", "TRIP_STATUS_CHANGE");
        String secret = (String) payload.getOrDefault("secret", "whsec_" + UUID.randomUUID().toString().substring(0, 12));

        if (url == null || url.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Webhook webhook = new Webhook();
        webhook.setId("WH-" + System.currentTimeMillis());
        webhook.setUrl(url);
        webhook.setEventType(eventType);
        webhook.setSecret(secret);
        webhook.setStatus("ACTIVE");

        Webhook saved = webhookRepository.save(webhook);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Webhook>> getWebhooks() {
        return ResponseEntity.ok(webhookRepository.findAll());
    }

    @PostMapping("/test-dispatch")
    public ResponseEntity<Map<String, Object>> testDispatch(@RequestBody Map<String, Object> payload) {
        String webhookId = (String) payload.getOrDefault("webhookId", "");
        String event = (String) payload.getOrDefault("event", "TRIP_STATUS_CHANGE");

        Webhook targetWebhook = webhookRepository.findById(webhookId).orElse(null);
        if (targetWebhook == null) {
            targetWebhook = new Webhook();
            targetWebhook.setId("WH-TEST-01");
            targetWebhook.setUrl("https://httpbin.org/post");
            targetWebhook.setEventType(event);
            targetWebhook.setSecret("whsec_test_secret_key");
        }

        Map<String, Object> sampleData = new HashMap<>();
        sampleData.put("tripNumber", "TRP-84920");
        sampleData.put("status", "DISPATCHED");
        sampleData.put("origin", "Indore (MP)");
        sampleData.put("destination", "Mumbai (MH)");
        sampleData.put("vehicleNumber", "MP-09-AB-1234");
        sampleData.put("driverName", "Ramesh Kumar");
        sampleData.put("freightAmount", 35000);
        sampleData.put("dispatchedAt", LocalDateTime.now().toString());

        Map<String, Object> dispatchResult = webhookService.dispatchToWebhook(targetWebhook, event, sampleData);
        return ResponseEntity.ok(dispatchResult);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWebhook(@PathVariable String id) {
        webhookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
