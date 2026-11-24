package com.tms.backend.controller;

import com.tms.backend.model.ApiKey;
import com.tms.backend.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.security.SecureRandom;
import java.util.*;

@RestController
@RequestMapping("/api/v1/api-keys")
@CrossOrigin(originPatterns = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class ApiKeyController {

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private final SecureRandom random = new SecureRandom();

    @GetMapping
    public ResponseEntity<List<ApiKey>> listApiKeys() {
        return ResponseEntity.ok(apiKeyRepository.findAll());
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiKey> generateApiKey(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.getOrDefault("name", "ERP Integration Key");
        String companyName = (String) payload.getOrDefault("companyName", "Partner Enterprise");
        String scopes = (String) payload.getOrDefault("scopes", "READ_TRIPS,WRITE_ORDERS,TALLY_SYNC");
        
        // Generate secure 32-character key starting with tms_live_
        StringBuilder sb = new StringBuilder("tms_live_");
        for (int i = 0; i < 28; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        String generatedKey = sb.toString();

        ApiKey apiKey = new ApiKey();
        apiKey.setKey(generatedKey);
        apiKey.setName(name);
        apiKey.setCompanyName(companyName);
        apiKey.setScopes(scopes);
        apiKey.setActive(true);

        ApiKey saved = apiKeyRepository.save(apiKey);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiKey> toggleApiKeyStatus(@PathVariable Long id) {
        ApiKey apiKey = apiKeyRepository.findById(id).orElse(null);
        if (apiKey == null) {
            return ResponseEntity.notFound().build();
        }
        apiKey.setActive(!Boolean.TRUE.equals(apiKey.getActive()));
        return ResponseEntity.ok(apiKeyRepository.save(apiKey));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApiKey(@PathVariable Long id) {
        apiKeyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
