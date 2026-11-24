package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "lr_bilty")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LR {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lr_number", unique = true)
    private String lrNumber;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    private String consignor;

    private String consignee;

    private Double weight;

    private BigDecimal amount;

    @Column(name = "from_location")
    private String fromLocation;

    @Column(name = "to_location")
    private String toLocation;

    private String status;

    @Column(name = "pod_status")
    private String podStatus;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    // Added fields
    private String lrDate;
    private String consignorAddress;
    private String consignorGST;
    private String consigneeAddress;
    private String consigneeGST;
    private String materialDescription;
    private String noOfArticles;
    private String consignorContact;
    private String consigneeContact;
    private Double chargedWeight;
    
    @Column(name = "eway_bill_number")
    private String ewayBillNumber;
    private java.math.BigDecimal freightRate;
    private java.math.BigDecimal advanceAmount;
    private java.math.BigDecimal toPay;

    @Column(name = "gst_percent")
    private Double gstPercent;

    @Column(name = "gst_amount")
    private java.math.BigDecimal gstAmount;

    @Column(name = "bilty_charge")
    private java.math.BigDecimal biltyCharge;

    @Column(name = "loading_charge")
    private java.math.BigDecimal loadingCharge;

    @Column(name = "weight_unit")
    private String weightUnit;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;

    @Column(name = "downloaded", nullable = false)
    private Boolean downloaded = false;
}

