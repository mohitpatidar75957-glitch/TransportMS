package com.tms.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private com.tms.backend.filter.ApiKeyFilter apiKeyFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Allow login/register
                .requestMatchers("/api/users/**").permitAll() // Allow users API
                .requestMatchers("/api/v1/compliance/**").permitAll() // Allow Compliance Tally & E-Way JSON downloads
                .requestMatchers("/api/v1/fleet/**").permitAll() // Allow fleet and maintenance records
                .requestMatchers("/api/tracking/**").permitAll() // Allow public live GPS tracking for driver phone link
                .requestMatchers("/api/v1/finance/**", "/api/v1/management/**").permitAll() // Allow finance & management settings
                .requestMatchers("/api/v1/resources/**", "/api/v1/ocr/**").permitAll() // Allow fuel records, anomaly checks & OCR without third-party fees
                .requestMatchers("/api/v1/hr/**").permitAll() // Allow HR staff, managers & attendance
                .requestMatchers("/api/v1/system/**", "/api/v1/audit/**").permitAll() // Allow System Health, Watchdog Monitors & Audit Logs
                .requestMatchers("/api/notifications/**", "/api/v1/notifications/**").permitAll() // Allow notifications & alerts
                .requestMatchers("/api/trips/estimate-delivery-time", "/api/trips/auto-freight", "/api/trips/route-ranking").permitAll()
                .requestMatchers("/api/v1/trips/**", "/api/v1/orders/**", "/api/v1/dispatch/**").permitAll() // Checked and rate-limited by ApiKeyFilter
                .requestMatchers("/api/docs/**", "/api-docs/**").permitAll() // Allow docs
                .requestMatchers("/api/fastag/**", "/api/gst/**", "/api/whatsapp/**", "/api/v1/smart-query/**").permitAll()
                .requestMatchers("/api/v1/api-keys/**", "/api/v1/webhooks/**").authenticated()
                .requestMatchers("/api/**").authenticated()  // Requires valid JWT token
                .anyRequest().permitAll() // Allow static files (frontend) and unknown routes to hit index.html
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
            
        http.addFilterBefore(apiKeyFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

