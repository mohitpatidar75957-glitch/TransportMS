package com.tms.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "rate_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RateCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name")
    private String customerName;

    private String origin;
    
    private String destination;
    
    private String vehicleType;
    
    private BigDecimal standardRate;

    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
