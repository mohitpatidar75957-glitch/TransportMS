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
            // Replace with your Railway public URL
            String url = "https://tms--management.up.railway.app/api/v1/webhooks";
            System.out.println("Pinging self to prevent sleep: " + url);
            restTemplate.getForObject(url, String.class);
            System.out.println("Ping successful.");
        } catch (Exception e) {
            System.out.println("Ping failed, but request was sent: " + e.getMessage());
        }
    }
}
