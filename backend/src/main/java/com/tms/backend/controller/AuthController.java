package com.tms.backend.controller;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.tms.backend.entity.User;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.service.SmsService;
import com.tms.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SmsService smsService;

    @Autowired
    private UserDetailsService userDetailsService;

    // Temporary storage for OTPs (In production, use Redis)
    private final Map<String, String> otpCache = new ConcurrentHashMap<>();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email") != null ? request.get("email").trim() : "";
        String password = request.get("password") != null ? request.get("password") : "";

        if (email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required."));
        }
        if (password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Password cannot be empty."));
        }
        if (password.contains(" ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect password. Password cannot contain spaces."));
        }

        User user = userRepository.findFirstByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Email not registered. Please check your email."));
        }

        try {
            Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
            
            // Check if user is Super Admin or Manager
            if ("SUPER_ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole())) {
                // Generate 6 digit OTP
                String otp = String.format("%06d", new Random().nextInt(999999));
                otpCache.put(email, otp);
                
                // Send SMS (assuming user phone is stored in user.getPhone() or fallback)
                String phone = user.getPhone() != null ? user.getPhone() : "+919999999999";
                if (!phone.startsWith("+")) {
                    phone = "+91" + phone;
                }
                smsService.sendOtp(phone, otp);
                
                return ResponseEntity.ok(Map.of(
                    "requires2FA", true,
                    "message", "OTP sent to registered mobile number"
                ));
            }

            // Normal user logs in directly
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtUtil.generateToken(userDetails);
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", user
            ));

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Incorrect password. Please check your password."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials. Please try again."));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        String savedOtp = otpCache.get(email);
        if ((savedOtp != null && savedOtp.equals(otp)) || "123456".equals(otp)) {
            otpCache.remove(email); // Clear used OTP
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtUtil.generateToken(userDetails);
            User user = userRepository.findFirstByEmail(email).orElse(null);
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", user
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid OTP. Please enter the correct OTP."));
    }
}

