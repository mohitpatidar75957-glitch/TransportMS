package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "payroll")
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

    public Payroll() {}

    public Payroll(Long id, Long employeeId, String employeeType, String monthYear, BigDecimal baseSalary, BigDecimal allowances, BigDecimal deductions, BigDecimal netPayable, String status, Long tenantId) {
        this.id = id;
        this.employeeId = employeeId;
        this.employeeType = employeeType;
        this.monthYear = monthYear;
        this.baseSalary = baseSalary;
        this.allowances = allowances;
        this.deductions = deductions;
        this.netPayable = netPayable;
        this.status = status;
        this.tenantId = tenantId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeType() { return employeeType; }
    public void setEmployeeType(String employeeType) { this.employeeType = employeeType; }

    public String getMonthYear() { return monthYear; }
    public void setMonthYear(String monthYear) { this.monthYear = monthYear; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public BigDecimal getAllowances() { return allowances; }
    public void setAllowances(BigDecimal allowances) { this.allowances = allowances; }

    public BigDecimal getDeductions() { return deductions; }
    public void setDeductions(BigDecimal deductions) { this.deductions = deductions; }

    public BigDecimal getNetPayable() { return netPayable; }
    public void setNetPayable(BigDecimal netPayable) { this.netPayable = netPayable; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
}
