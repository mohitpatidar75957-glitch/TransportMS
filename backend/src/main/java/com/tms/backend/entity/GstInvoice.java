package com.tms.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "gst_invoices")
public class GstInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    private String client;
    private LocalDate date;
    private Double amount;
    private Double gstPercent;
    private Double gstAmount;
    private Double total;
    
    // e.g. "Fully Exempt", "Mixed Commodities", "Multimodal (No ITC)", "Multimodal (With ITC)"
    private String gstCategory;
    
    // "Collected" or "Paid"
    private String type;
    
    // "Paid" or "Pending"
    private String status;
}
