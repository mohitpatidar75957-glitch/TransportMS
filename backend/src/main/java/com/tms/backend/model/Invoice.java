package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", unique = true)
    private String invoiceNumber;

    @Column(name = "client_name")
    private String clientName;

    private LocalDate date;

    private BigDecimal amount;

    private String status; // Paid, Unpaid

    @Column(length = 64)
    private String irn; // Invoice Reference Number (64-char hash)

    @Column(name = "ack_number")
    private String ackNumber; // Acknowledgement Number from NIC Portal

    @Column(name = "ack_date")
    private java.time.LocalDateTime ackDate;

    @Column(name = "qr_code_data", columnDefinition = "TEXT")
    private String qrCodeData; // Signed QR Code Data string for print

    @Column(name = "einvoice_status")
    private String einvoiceStatus; // GENERATED, PENDING, CANCELLED

    @Column(name = "hsn_code")
    private String hsnCode; // Default 996511 for GTA transport services

    @Column(name = "consignor_gst")
    private String consignorGst;

    @Column(name = "consignee_gst")
    private String consigneeGst;

    @Column(name = "eway_bill_number")
    private String ewayBillNumber;

    @Column(name = "rcm_applicable")
    private Boolean rcmApplicable = false; // Reverse Charge Mechanism (GTA GST paid by recipient)

    @Column(name = "tds_applicable")
    private Boolean tdsApplicable = false; // TDS deduction (Sec 194C)

    @Column(name = "tds_rate")
    private BigDecimal tdsRate = BigDecimal.ZERO; // e.g., 1.0 or 2.0 %

    @Column(name = "tds_amount")
    private BigDecimal tdsAmount = BigDecimal.ZERO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "upi_id")
    private String upiId;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @OneToMany(mappedBy = "invoice")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Payment> payments;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
