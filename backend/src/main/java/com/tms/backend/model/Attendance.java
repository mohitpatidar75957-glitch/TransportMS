package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    @Column(name = "employee_type")
    private String employeeType; // Driver, Staff

    @Column(name = "employee_id")
    private Long employeeId; // ID of either Driver or Staff based on type

    @Column(name = "employee_name")
    private String employeeName; // Added to store name directly in DB as requested

    private String status; // Present, Absent, Half-Day, Leave
    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
