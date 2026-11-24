package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private String type; // Credit, Debit

    private BigDecimal amount;

    private String description;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
