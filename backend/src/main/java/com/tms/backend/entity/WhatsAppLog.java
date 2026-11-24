package com.tms.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "whatsapp_logs")
public class WhatsAppLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String recipientNumber;
    private String templateName;
    private LocalDateTime sentAt;
    private String status;
}
