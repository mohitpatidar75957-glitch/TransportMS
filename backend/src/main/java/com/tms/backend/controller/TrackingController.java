package com.tms.backend.controller;

import com.tms.backend.entity.TrackingSession;
import com.tms.backend.repository.TrackingSessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(originPatterns = "*")
public class TrackingController {

    private final TrackingSessionRepository repository;

    public TrackingController(TrackingSessionRepository repository) {
        this.repository = repository;
    }

    // Get all active sessions for the admin map
    @GetMapping("/sessions")
    public ResponseEntity<List<TrackingSession>> getActiveSessions() {
        return ResponseEntity.ok(repository.findAll());
    }

    // Get a specific session for the driver view
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<TrackingSession> getSession(@PathVariable String sessionId) {
        return repository.findById(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin creates a tracking link for a driver (reuses existing vehicle session to prevent duplicates)
    @PostMapping("/start")
    public ResponseEntity<TrackingSession> startTrackingSession(@RequestBody Map<String, String> request) {
        String vehicleId = request.get("vehicleId");
        String driverPhone = request.get("driverPhone");
        String driverName = request.get("driverName");

        TrackingSession session = null;
        if (vehicleId != null && !vehicleId.trim().isEmpty()) {
            session = repository.findFirstByVehicleIdIgnoreCaseOrderByStartedAtDesc(vehicleId.trim()).orElse(null);
        }

        if (session == null) {
            session = new TrackingSession();
            session.setSessionId(UUID.randomUUID().toString());
            session.setStartedAt(LocalDateTime.now());
        }

        session.setVehicleId(vehicleId != null ? vehicleId.trim() : "");
        session.setDriverPhone(driverPhone);
        session.setDriverName(driverName);
        session.setStatus("ACTIVE");
        session.setLastUpdated(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(session));
    }

    // Driver mobile web view sends live location
    @PostMapping("/update/{sessionId}")
    public ResponseEntity<?> updateLocation(@PathVariable String sessionId, @RequestBody Map<String, Double> location) {
        return repository.findById(sessionId).map(session -> {
            session.setLatitude(location.get("latitude"));
            session.setLongitude(location.get("longitude"));
            session.setSpeed(location.get("speed"));
            session.setLastUpdated(LocalDateTime.now());
            repository.save(session);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
