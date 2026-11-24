package com.tms.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KeepAwakeService {

    private final RestTemplate restTemplate = new RestTemplate();

    // Runs every 10 minutes (600,000 milliseconds)
    @Scheduled(fixedRate = 600000)
    public void pingSelf() {
        try {
            String renderUrl = System.getenv("RENDER_EXTERNAL_URL");
            if (renderUrl != null && !renderUrl.isEmpty()) {
                String url = renderUrl + "/api/v1/health";
                restTemplate.getForObject(url, String.class);
            }
        } catch (Exception ignored) {
        }
    }
}
