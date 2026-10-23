package com.tms.backend.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/fuel")
@CrossOrigin(originPatterns = "*")
public class FuelController {

    private final Map<String, Double> basePrices = new HashMap<>();
    private final Random random = new Random();

    public FuelController() {
        // Realistic Diesel prices for major cities/states (as of late 2023/2024 approx)
        basePrices.put("delhi", 89.62);
        basePrices.put("mumbai", 92.15);
        basePrices.put("chennai", 92.34);
        basePrices.put("kolkata", 90.76);
        basePrices.put("bangalore", 88.94);
        basePrices.put("hyderabad", 95.65);
        basePrices.put("pune", 90.11);
        basePrices.put("ahmedabad", 92.17);
        basePrices.put("gujarat", 92.17);
        basePrices.put("gujrat", 92.17); // handling typo
        basePrices.put("jaipur", 90.32);
        basePrices.put("lucknow", 89.76);
        basePrices.put("surat", 92.31);
        basePrices.put("kanpur", 89.81);
        basePrices.put("nagpur", 89.96);
        basePrices.put("indore", 91.84);
        basePrices.put("bhopal", 91.84);
        basePrices.put("mp", 91.84);
        basePrices.put("maharashtra", 92.15);
        basePrices.put("up", 89.76);
    }

    @GetMapping("/price")
    public Map<String, Object> getFuelPrice(@RequestParam(required = false, defaultValue = "") String city) {
        String cityKey = city.trim().toLowerCase();
        
        Double livePrice = fetchLivePriceFromGoodReturns(cityKey);
        double price;
        
        if (livePrice != null) {
            price = livePrice;
        } else if (basePrices.containsKey(cityKey)) {
            price = basePrices.get(cityKey);
        } else {
            // Generate a more consistent hash-based realistic price for unknown cities (between 88 and 96)
            int hash = Math.abs(cityKey.hashCode());
            price = 88.0 + (hash % 800) / 100.0;
        }

        // Format to 2 decimal places
        price = Math.round(price * 100.0) / 100.0;

        Map<String, Object> response = new HashMap<>();
        response.put("city", city);
        response.put("price", price);
        response.put("currency", "INR");
        response.put("isLive", livePrice != null);
        return response;
    }

    private Double fetchLivePriceFromGoodReturns(String city) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                    .connectTimeout(java.time.Duration.ofSeconds(4))
                    .build();
                    
            String url = "https://www.goodreturns.in/diesel-price-in-" + city + ".html";
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(url))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();
                    
            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            String html = response.body();
            
            // Regex to find the rate in the title e.g. "Rs. 99.70/Ltr"
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("Rs\\.\\s*([0-9]+\\.[0-9]+)/Ltr");
            java.util.regex.Matcher matcher = pattern.matcher(html);
            if (matcher.find()) {
                return Double.parseDouble(matcher.group(1));
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch live fuel price for " + city + ": " + e.getMessage());
        }
        return null;
    }
}
