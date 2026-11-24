package com.tms.backend.config;

import com.tms.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import com.tms.backend.repository.UserRepository;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                logger.warn("Invalid JWT Token");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails)) {

                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        
        try {
            Long resolvedTenantId = null;

            // 1. Check if client explicitly requested a company scope via header
            String headerTenant = request.getHeader("X-Company-Id");
            if (headerTenant == null || headerTenant.isBlank()) {
                headerTenant = request.getHeader("X-Tenant-Id");
            }
            if (headerTenant == null || headerTenant.isBlank()) {
                headerTenant = request.getParameter("company_id");
            }
            if (headerTenant == null || headerTenant.isBlank()) {
                headerTenant = request.getParameter("tenant_id");
            }

            if (headerTenant != null && !headerTenant.isBlank()) {
                try {
                    resolvedTenantId = Long.parseLong(headerTenant.trim());
                } catch (NumberFormatException ignored) {}
            }

            // 2. Fallback to authenticated user's tenant_id if available
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                String authName = SecurityContextHolder.getContext().getAuthentication().getName();
                com.tms.backend.entity.User user = userRepository.findFirstByEmail(authName).orElse(null);
                if (user != null) {
                    // Non-SUPER_ADMIN users cannot spoof other companies
                    if (!"SUPER_ADMIN".equalsIgnoreCase(user.getRole())) {
                        if (user.getTenantId() != null) {
                            resolvedTenantId = user.getTenantId();
                        }
                    } else if (resolvedTenantId == null) {
                        resolvedTenantId = user.getTenantId();
                    }
                }
            }

            // 3. Default fallback to Company 1
            if (resolvedTenantId == null) {
                resolvedTenantId = 1L;
            }

            TenantContext.setCurrentTenant(resolvedTenantId);
            request.setAttribute("companyId", resolvedTenantId);
            request.setAttribute("tenantId", resolvedTenantId);

            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
