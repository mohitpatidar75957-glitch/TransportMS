package com.tms.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "license_number", unique = true)
    private String licenseNumber;

    @Column(name = "license_expiry", nullable = true)
    private LocalDate licenseExpiry;

    @Column(name = "aadhar_number", nullable = true)
    private String aadharNumber;

    @Column(name = "pan_number", nullable = true)
    private String panNumber;

    private String phone;

    @Column(name = "alt_phone", nullable = true)
    private String altPhone;

    @Column(name = "blood_group", nullable = true)
    private String bloodGroup;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String status; // Available, On Trip, On Leave

    @Column(name = "joined_date", nullable = true)
    private LocalDate joinedDate;

    @Column(name = "salary_type", nullable = true)
    private String salaryType; // Monthly, Per Trip, Percentage

    @Column(name = "salary_amount", nullable = true)
    private Double salaryAmount;

    @ManyToOne
    @JoinColumn(name = "assigned_vehicle_id")
    private Vehicle assignedVehicle;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;

    public Driver() {}

    // --- Getters & Setters ---

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public LocalDate getLicenseExpiry() { return licenseExpiry; }
    public void setLicenseExpiry(LocalDate licenseExpiry) { this.licenseExpiry = licenseExpiry; }

    public String getAadharNumber() { return aadharNumber; }
    public void setAadharNumber(String aadharNumber) { this.aadharNumber = aadharNumber; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAltPhone() { return altPhone; }
    public void setAltPhone(String altPhone) { this.altPhone = altPhone; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; }

    public String getSalaryType() { return salaryType; }
    public void setSalaryType(String salaryType) { this.salaryType = salaryType; }

    public Double getSalaryAmount() { return salaryAmount; }
    public void setSalaryAmount(Double salaryAmount) { this.salaryAmount = salaryAmount; }

    public Vehicle getAssignedVehicle() { return assignedVehicle; }
    public void setAssignedVehicle(Vehicle assignedVehicle) { this.assignedVehicle = assignedVehicle; }
}
