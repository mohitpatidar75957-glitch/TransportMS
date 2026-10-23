package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "payroll")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "employee_type")
    private String employeeType; // Driver, Staff

    @Column(name = "month_year")
    private String monthYear; // e.g., "08/2026"

    @Column(name = "base_salary")
    private BigDecimal baseSalary;

    private BigDecimal allowances = BigDecimal.ZERO;

    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(name = "net_payable")
    private BigDecimal netPayable;

    private String status; // Paid, Pending
    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
