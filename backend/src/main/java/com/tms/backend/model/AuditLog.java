package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action_by", nullable = false)
    private String actionBy;

    @Column(name = "entity_name", nullable = false)
    private String entityName;

    @Column(name = "entity_id", nullable = false)
    private String entityId;

    @Column(nullable = false)
    private String action; // CREATED, UPDATED, DELETED, STATUS_CHANGED

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "timestamp", updatable = false, nullable = false)
    private LocalDateTime timestamp;
    
    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
