package com.tms.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tracking_sessions")
public class TrackingSession {

    @Id
    @Column(unique = true, nullable = false)
    private String sessionId; // A UUID string for the tracking link

    private String vehicleId;
    private String driverPhone;
    private String driverName;

    // e.g., "ACTIVE", "INACTIVE"
    private String status = "INACTIVE";

    // Latest location data
    private Double latitude;
    private Double longitude;
    private Double speed; // in km/h

    private LocalDateTime startedAt;
    private LocalDateTime lastUpdated;
}
