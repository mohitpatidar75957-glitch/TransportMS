package com.tms.backend.repository;

import com.tms.backend.model.Webhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, String> {
    List<Webhook> findByStatusAndEventType(String status, String eventType);
}
