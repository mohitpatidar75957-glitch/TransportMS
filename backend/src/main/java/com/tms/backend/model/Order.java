package com.tms.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "cargo_details")
    private String cargoDetails;

    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "drop_location")
    private String dropLocation;

    @Column(name = "weight")
    private String weight;

    @Column(name = "amount")
    private String amount;

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ASSIGNED, COMPLETED

    @OneToMany(mappedBy = "order")
    @JsonIgnore
    private List<Trip> trips;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;
}
