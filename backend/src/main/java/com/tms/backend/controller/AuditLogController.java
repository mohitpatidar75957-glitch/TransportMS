package com.tms.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.tms.backend.model.AuditLog;
import com.tms.backend.repository.AuditLogRepository;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@CrossOrigin(originPatterns = "*")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public List<AuditLog> getLogs() {
        return auditLogRepository.findAll();
    }
}
