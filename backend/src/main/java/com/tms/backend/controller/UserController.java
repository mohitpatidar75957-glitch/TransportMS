package com.tms.backend.controller;

import com.tms.backend.entity.User;
import com.tms.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Using existing CORS approach for now
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private com.tms.backend.service.AuditService auditService;

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user, @RequestHeader(value = "X-User-Role", required = false) String creatorRole, HttpServletRequest request) {
        String role = creatorRole != null ? creatorRole : "SUPER_ADMIN";
        if ("MANAGER".equalsIgnoreCase(role) && ("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) || "MANAGER".equalsIgnoreCase(user.getRole()))) {
            return ResponseEntity.status(403).body(Map.of("message", "Access Denied: Managers cannot create Admin or Manager accounts. Only Super Admin can perform this action."));
        }
        try {
            User createdUser = userService.createUser(user, role);
            try {
                auditService.logAction(request, "CREATED", "User", createdUser.getId(), null, createdUser.getEmail() + " (" + createdUser.getRole() + ")", "Created user " + createdUser.getName());
            } catch (Exception ex) {}
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @Autowired
    private com.tms.backend.repository.UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        if (credentials == null) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid credentials"));
        }
        String email = credentials.get("email") != null ? credentials.get("email").trim() : "";
        String password = credentials.get("password") != null ? credentials.get("password").trim() : "";
        
        // Find user by email (case-insensitive, trimmed)
        User user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(email))
                .findFirst()
                .orElse(null);
                
        if (user != null && user.getPassword() != null && user.getPassword().equals(password)) {
            return ResponseEntity.ok(user);
        }

        // Direct Fail-Safe Fallbacks for Default Admin / Manager Accounts
        if ("superadmin@tms.com".equalsIgnoreCase(email) && "CoderVu".equals(password)) {
            User admin = userRepository.findFirstByEmail("superadmin@tms.com").orElse(new User());
            admin.setName("Super Admin");
            admin.setEmail("superadmin@tms.com");
            admin.setPassword("CoderVu");
            admin.setRole("SUPER_ADMIN");
            admin.setPhone("9040065140");
            if (admin.getAddress() == null || admin.getAddress().isEmpty() || admin.getAddress().contains("Bhadrak")) admin.setAddress("India, indore");
            admin.setAllowedPaths("*");
            user = userRepository.save(admin);
            return ResponseEntity.ok(user);
        }

        if ("admin@tms.com".equalsIgnoreCase(email) && "admin".equals(password)) {
            User admin2 = userRepository.findFirstByEmail("admin@tms.com").orElse(new User());
            admin2.setName("Admin User");
            admin2.setEmail("admin@tms.com");
            admin2.setPassword("admin");
            admin2.setRole("SUPER_ADMIN");
            admin2.setAllowedPaths("*");
            user = userRepository.save(admin2);
            return ResponseEntity.ok(user);
        }

        if ("manager@tms.com".equalsIgnoreCase(email) && "password".equals(password)) {
            User manager = userRepository.findFirstByEmail("manager@tms.com").orElse(new User());
            manager.setName("Operations Manager");
            manager.setEmail("manager@tms.com");
            manager.setPassword("password");
            manager.setRole("MANAGER");
            user = userRepository.save(manager);
            return ResponseEntity.ok(user);
        }

        if ("ramesh@tms.com".equalsIgnoreCase(email) && "CoderVu".equals(password)) {
            User ramesh = userRepository.findFirstByEmail("ramesh@tms.com").orElse(new User());
            ramesh.setName("Ramesh (Driver)");
            ramesh.setEmail("ramesh@tms.com");
            ramesh.setPassword("CoderVu");
            ramesh.setRole("DRIVER");
            ramesh.setAllowedPaths("/trips,/tracking,/whatsapp,/attendance,/payroll,/profile");
            user = userRepository.save(ramesh);
            return ResponseEntity.ok(user);
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password."));
    }


    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getAllUsers().stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user, @RequestHeader(value = "X-User-Role", required = false) String requesterRole, HttpServletRequest request) {
        try {
            User existing = userRepository.findById(id).orElse(null);
            String oldVal = existing != null ? (existing.getEmail() + " (" + existing.getRole() + ")") : null;
            User updatedUser = userService.updateUser(id, user, requesterRole != null ? requesterRole : "SUPER_ADMIN");
            String newVal = updatedUser.getEmail() + " (" + updatedUser.getRole() + ")";
            try {
                auditService.logAction(request, "EDITED", "User", updatedUser.getId(), oldVal, newVal, "Updated user " + updatedUser.getName());
            } catch (Exception ex) {}
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String requesterRole, HttpServletRequest request) {
        try {
            User existing = userRepository.findById(id).orElse(null);
            String oldVal = existing != null ? existing.getEmail() : ("ID #" + id);
            userService.deleteUser(id, requesterRole != null ? requesterRole : "SUPER_ADMIN");
            try {
                auditService.logAction(request, "DELETED", "User", id, oldVal, null, "Deleted user " + oldVal);
            } catch (Exception ex) {}
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
