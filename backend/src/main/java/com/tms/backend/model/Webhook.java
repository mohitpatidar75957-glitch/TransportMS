package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "webhooks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Webhook {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String id;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "secret", nullable = false)
    private String secret;

    @Column(name = "status")
    private String status = "ACTIVE";

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "tenant_id")
    private Long tenantId;
}
