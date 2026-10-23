package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_name")
    private String senderName;

    private String email;

    private String phone;

    @Column(name = "date_received")
    private LocalDateTime dateReceived = LocalDateTime.now();

    private String company;
    
    private String fleetSize;
    
    private String teamSize;

    private String subject;

    @Column(name = "message_body", columnDefinition = "TEXT")
    private String messageBody;

    private String status; // Read, Unread
    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
