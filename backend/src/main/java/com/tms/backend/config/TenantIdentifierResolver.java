package com.tms.backend.config;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;

/**
 * Tenant identifier resolver for Hibernate 6 @TenantId discriminator multi-tenancy.
 * Automatically supplies the active tenant ID from TenantContext, defaulting to Tenant 1.
 */
@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<Long> {

    @Override
    public Long resolveCurrentTenantIdentifier() {
        Long tenantId = TenantContext.getCurrentTenant();
        return tenantId != null ? tenantId : 1L;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
