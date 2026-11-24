package com.tms.backend.filter;

import com.tms.backend.model.ApiKey;
import com.tms.backend.repository.ApiKeyRepository;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        
        // Only protect /api/v1/ endpoints
        if (!path.startsWith("/api/v1/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check for API Key in either X-API-KEY header or Bearer header (e.g., Authorization: Bearer tms_live_...)
        String apiKeyHeader = request.getHeader("X-API-KEY");
        String authHeader = request.getHeader("Authorization");

        if (apiKeyHeader == null && authHeader != null && authHeader.startsWith("Bearer tms_live_")) {
            apiKeyHeader = authHeader.substring(7).trim();
        }

        // Skip API Key check for frontend requests that use JWT Authorization (non-tms_live token)
        if (apiKeyHeader == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip OPTIONS requests (CORS preflight)
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Also check query parameter 'apiKey' or 'key' so users can open URLs in browser address bar (e.g. ?apiKey=tms_live_...)
        if (apiKeyHeader == null || apiKeyHeader.isEmpty()) {
            apiKeyHeader = request.getParameter("apiKey");
            if (apiKeyHeader == null) {
                apiKeyHeader = request.getParameter("key");
            }
        }

        // Allow internal frontend endpoints (fleet, finance, hr, management, compliance, resources, ocr, system, dispatch, orders, audit) to proceed without mandatory API key
        if ((apiKeyHeader == null || apiKeyHeader.isEmpty()) && 
            (path.startsWith("/api/v1/compliance/") || 
             path.startsWith("/api/v1/fleet/") || 
             path.startsWith("/api/v1/hr/") || 
             path.startsWith("/api/v1/finance/") || 
             path.startsWith("/api/v1/resources/") || 
             path.startsWith("/api/v1/ocr/") || 
             path.startsWith("/api/v1/system/") || 
             path.startsWith("/api/v1/management/") || 
             path.startsWith("/api/v1/dispatch/") || 
             path.startsWith("/api/v1/orders") || 
             path.startsWith("/api/v1/audit") || 
             (path.startsWith("/api/v1/trips/") && request.getMethod().equalsIgnoreCase("GET")))) {
            filterChain.doFilter(request, response);
            return;
        }

        if (apiKeyHeader == null || apiKeyHeader.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Missing API Key. Provide via 'X-API-KEY' header or '?apiKey=<key>' parameter.\"}");
            return;
        }

        ApiKey apiKey = apiKeyRepository.findByKeyAndActiveTrue(apiKeyHeader).orElse(null);
        if (apiKey == null && "tms_live_test_demo".equals(apiKeyHeader)) {
            // Built-in sandbox key for /api/docs interactive live testing
            apiKey = new ApiKey();
            apiKey.setKey("tms_live_test_demo");
            apiKey.setName("Sandbox Partner Key");
            apiKey.setCompanyName("Sandbox Logistics");
            apiKey.setCompanyId(1L);
            apiKey.setScopes("READ_TRIPS,WRITE_ORDERS,TALLY_SYNC,WRITE");
            apiKey.setActive(true);
        }

        if (apiKey == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Invalid or inactive API Key. Generate a live key from System Settings.\"}");
            return;
        }

        // Check Scopes (Basic check)
        String method = request.getMethod();
        if (method.equals("POST") || method.equals("PUT") || method.equals("DELETE")) {
            if (apiKey.getScopes() != null && !apiKey.getScopes().contains("WRITE")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Insufficient scopes. WRITE access required.");
                return;
            }
        }

        // Rate Limiting (60 requests per minute per key)
        Bucket bucket = buckets.computeIfAbsent(apiKeyHeader, k -> {
            Bandwidth limit = Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));
            return Bucket.builder().addLimit(limit).build();
        });

        if (!bucket.tryConsume(1)) {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("Rate limit exceeded (Max 60 requests/minute)");
            return;
        }

        // Update last used time
        apiKey.setLastUsedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);

        // Inject company_id into TenantContext and request attributes for downstream controllers
        Long companyTenantId = apiKey.getCompanyId() != null ? apiKey.getCompanyId() : 1L;
        com.tms.backend.config.TenantContext.setCurrentTenant(companyTenantId);
        request.setAttribute("companyId", companyTenantId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            com.tms.backend.config.TenantContext.clear();
        }
    }
}
