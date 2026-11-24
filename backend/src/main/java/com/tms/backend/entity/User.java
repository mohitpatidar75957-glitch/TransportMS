package com.tms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "tms_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    private String companyName;
    
    private String gstNumber;
    
    private String email;
    
    private String password;
    
    private String role; // e.g., "SUPER_ADMIN", "MANAGER", "DRIVER"
    
    private String phone;
    
    private LocalDate joinDate;
    
    private String address;
    
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String allowedPaths;
    
    @jakarta.persistence.Column(name = "tenant_id", nullable = true)
    private Long tenantId = 1L;
}


