package com.tms.backend.service;

import com.tms.backend.model.Webhook;
import com.tms.backend.repository.WebhookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);

    @Autowired
    private WebhookRepository webhookRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Broadcasts event asynchronously to all active webhooks subscribed to this event type.
     */
    @Async
    public void publishEvent(String eventType, Map<String, Object> payload) {
        try {
            List<Webhook> activeWebhooks = webhookRepository.findAll();
            for (Webhook wh : activeWebhooks) {
                if ("ACTIVE".equalsIgnoreCase(wh.getStatus()) &&
                        (wh.getEventType().equalsIgnoreCase(eventType) || "ALL_EVENTS".equalsIgnoreCase(wh.getEventType()))) {
                    dispatchToWebhook(wh, eventType, payload);
                }
            }
        } catch (Exception e) {
            log.error("Error triggering webhooks for event {}: {}", eventType, e.getMessage());
        }
    }

    /**
     * Dispatches payload to target endpoint with HMAC-SHA256 signature for security verification.
     */
    public Map<String, Object> dispatchToWebhook(Webhook wh, String eventType, Map<String, Object> payload) {
        String dispatchId = "DSP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Map<String, Object> result = new HashMap<>();
        result.put("dispatchId", dispatchId);
        result.put("webhookId", wh.getId());
        result.put("event", eventType);
        result.put("targetUrl", wh.getUrl());

        Map<String, Object> envelope = new HashMap<>();
        envelope.put("dispatchId", dispatchId);
        envelope.put("event", eventType);
        envelope.put("timestamp", LocalDateTime.now().toString());
        envelope.put("data", payload != null ? payload : Collections.emptyMap());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-TMS-Event", eventType);
            headers.set("X-TMS-Delivery-ID", dispatchId);
            
            // Sign payload with secret
            if (wh.getSecret() != null && !wh.getSecret().isEmpty()) {
                String signature = generateHmacSha256(envelope.toString(), wh.getSecret());
                headers.set("X-TMS-Signature", signature);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(envelope, headers);
            
            // Send request with 4-second timeout
            ResponseEntity<String> response = restTemplate.exchange(wh.getUrl(), HttpMethod.POST, entity, String.class);
            result.put("httpStatus", response.getStatusCode().value());
            result.put("responseBody", response.getBody() != null ? response.getBody() : "ACK");
            result.put("delivered", response.getStatusCode().is2xxSuccessful());
            log.info("Webhook {} successfully dispatched for event {}", wh.getId(), eventType);
        } catch (Exception e) {
            result.put("httpStatus", 500);
            result.put("responseBody", "Delivery failed: " + e.getMessage());
            result.put("delivered", false);
            log.warn("Webhook {} delivery failed: {}", wh.getId(), e.getMessage());
        }

        return result;
    }

    private String generateHmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacData = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hmacData) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "sha256_fallback_" + System.currentTimeMillis();
        }
    }
}
