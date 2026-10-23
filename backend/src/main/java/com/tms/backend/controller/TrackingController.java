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
@CrossOrigin(origins = "*")
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

    // Admin creates a tracking link for a driver
    @PostMapping("/start")
    public ResponseEntity<TrackingSession> startTrackingSession(@RequestBody Map<String, String> request) {
        TrackingSession session = new TrackingSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setVehicleId(request.get("vehicleId"));
        session.setDriverPhone(request.get("driverPhone"));
        session.setDriverName(request.get("driverName"));
        session.setStatus("ACTIVE");
        session.setStartedAt(LocalDateTime.now());
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
