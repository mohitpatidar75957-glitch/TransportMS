package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "fuel_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    private Double liters;

    @Column(name = "odometer_reading")
    private Double odometerReading;

    private BigDecimal rate;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
    
    @Column(name = "payment_mode")
    private String paymentMode;
    
    @Column(name = "payment_status")
    private String paymentStatus;
    
    @Column(name = "is_flagged")
    private Boolean isFlagged = false;
    
    @Column(name = "flag_reason", length = 500)
    private String flagReason;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
