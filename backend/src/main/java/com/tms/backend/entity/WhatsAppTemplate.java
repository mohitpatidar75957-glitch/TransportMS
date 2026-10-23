package com.tms.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "whatsapp_templates")
public class WhatsAppTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String triggerEvent;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private Boolean active;
}
