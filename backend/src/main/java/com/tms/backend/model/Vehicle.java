package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles", indexes = {
    @Index(name = "idx_vehicle_status", columnList = "status"),
    @Index(name = "idx_vehicle_tenant", columnList = "tenant_id"),
    @Index(name = "idx_vehicle_reg", columnList = "registration_number")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    private String name; // e.g. Tata Prima

    private String type; // Truck, Trailer, etc.
    
    private String capacity;

    private String status; // Active, In Maintenance, Off Duty
    
    private String ownership; // Owned, Leased

    private Double mileage; // Average (KM/L)

    private String model;
    
    @Column(name = "chassis_number", nullable = true)
    private String chassisNumber;
    
    @Column(name = "engine_number", nullable = true)
    private String engineNumber;

    private String fuelType;
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDate insuranceExpiry;
    private LocalDate pucExpiry;
    private LocalDate permitExpiry;
    private LocalDate fitnessExpiry;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true) // Set nullable=true temporarily to avoid breaking existing DB inserts if they don't provide it
    private Long tenantId;
}
