package com.tms.backend;

import org.hibernate.annotations.TenantId;

public class TestTenant {
    @TenantId
    private String tenantId;
}
