package com.tms.backend.repository;

import com.tms.backend.entity.WhatsAppLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WhatsAppLogRepository extends JpaRepository<WhatsAppLog, Long> {
}
