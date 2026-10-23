package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicle_maintenance_records", indexes = {
    @Index(name = "idx_vmr_vehicle", columnList = "vehicle_id"),
    @Index(name = "idx_vmr_type", columnList = "service_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "service_type", nullable = false)
    private String serviceType; // Scheduled Service, Tyre Replacement, Battery Replacement, Major Engine Repair, Brake Overhaul, Routine Inspection

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "odometer_reading")
    private Double odometerReading;

    @Column(name = "cost")
    private BigDecimal cost;

    @Column(name = "vendor_garage")
    private String vendorGarage; // Workshop or tyre dealer name

    // Tyre Specific Tracking
    @Column(name = "tyre_position")
    private String tyrePosition; // Front-Left, Front-Right, Rear-Left-Outer, Rear-Left-Inner, Rear-Right-Outer, Rear-Right-Inner, Spare

    @Column(name = "tyre_serial_number")
    private String tyreSerialNumber; // Unique Tyre Serial / DOT Code e.g. AP-984210-24

    @Column(name = "tyre_brand")
    private String tyreBrand; // MRF, Apollo EnduTrax, JK Tyre, CEAT, Bridgestone

    @Column(name = "current_tread_depth_mm")
    private Double currentTreadDepthMm; // Tread depth in mm (e.g. 15mm new, <3mm replace)

    @Column(name = "tyre_rotation_due_km")
    private Double tyreRotationDueKm; // Odometer km when rotation is due (e.g. installed at 50,000 km + 10,000 km = 60,000 km)

    @Column(name = "tyre_change_due_km")
    private Double tyreChangeDueKm; // Odometer km when replacement is due (e.g. 110,000 km)

    // Next scheduled service tracking
    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;

    @Column(name = "next_service_km")
    private Double nextServiceKm;

    @Column(name = "status")
    private String status = "Pending"; // "Pending", "Approved", "Rejected"

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private java.time.LocalDateTime approvedAt;

    @Column(name = "payment_status")
    private String paymentStatus = "Unpaid"; // "Unpaid", "Paid"

    @Column(name = "paid_amount")
    private BigDecimal paidAmount;

    @Column(name = "payment_mode")
    private String paymentMode; // "UPI", "Bank Transfer", "Cash", "Company Card"

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "reference_number")
    private String referenceNumber; // UTR, Cheque No, or Bill No

    @Column(columnDefinition = "TEXT")
    private String notes;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId = 1L;
}
