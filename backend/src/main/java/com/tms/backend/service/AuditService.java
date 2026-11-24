package com.tms.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.tms.backend.model.AuditLog;
import com.tms.backend.repository.AuditLogRepository;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired(required = false)
    private jakarta.servlet.http.HttpServletRequest request;

    public void logAction(String actionBy, String entityName, String entityId, String action, String description) {
        logAction(actionBy, entityName, entityId, action, null, null, description);
    }

    public void logAction(jakarta.servlet.http.HttpServletRequest req, String action, String entityName, Long entityId, String oldValue, String newValue, String description) {
        String actionBy = req != null ? req.getHeader("X-User-Role") : null;
        logAction(actionBy, entityName, entityId != null ? String.valueOf(entityId) : "-", action, oldValue, newValue, description);
    }

    public void logAction(String actionBy, String entityName, Long entityId, String action, String oldValue, String newValue, String description) {
        logAction(actionBy, entityName, entityId != null ? String.valueOf(entityId) : "-", action, oldValue, newValue, description);
    }

    public void logAction(String actionBy, String action, String entityName, Long entityId, String oldValue, String newValue, String description) {
        logAction(actionBy, entityName, entityId != null ? String.valueOf(entityId) : "-", action, oldValue, newValue, description);
    }

    public void logAction(String actionBy, String entityName, String entityId, String action, String oldValue, String newValue, String description) {
        String finalActionBy = actionBy;

        if ((finalActionBy == null || finalActionBy.isEmpty() || "SYSTEM".equalsIgnoreCase(finalActionBy)) && request != null) {
            String roleHeader = request.getHeader("X-User-Role");
            if (roleHeader != null && !roleHeader.isEmpty()) {
                finalActionBy = roleHeader;
            }
        }

        if (finalActionBy == null || finalActionBy.isEmpty() || "SYSTEM".equalsIgnoreCase(finalActionBy)) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                finalActionBy = auth.getName(); // Usually email or username
            } else if (finalActionBy == null || finalActionBy.isEmpty()) {
                finalActionBy = "Admin";
            }
        }

        if ("superadmin@tms.com".equalsIgnoreCase(finalActionBy) || "SUPER_ADMIN".equalsIgnoreCase(finalActionBy)) {
            finalActionBy = "Admin";
        }

        String finalDesc = description;
        if (finalDesc != null && !finalDesc.toLowerCase().contains(" by ")) {
            finalDesc = finalDesc + " by " + finalActionBy;
        }

        AuditLog log = new AuditLog();
        log.setActionBy(finalActionBy);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setDescription(finalDesc);

        Long currentTenant = com.tms.backend.config.TenantContext.getCurrentTenant();
        log.setTenantId(currentTenant != null ? currentTenant : 1L);

        auditLogRepository.save(log);
    }
}
