package com.tms.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "trips", indexes = {
    @Index(name = "idx_trip_status", columnList = "status"),
    @Index(name = "idx_trip_tenant", columnList = "tenant_id"),
    @Index(name = "idx_trip_vehicle", columnList = "vehicle_id")
})
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_number", unique = true)
    private String tripNumber; // e.g., TRP-01015

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @OneToMany(mappedBy = "trip")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<LR> lrs;

    @OneToMany(mappedBy = "trip")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Invoice> invoices;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    private String route;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "freight_amount", nullable = false)
    private BigDecimal freightAmount;

    @Column(name = "freight_rate")
    private BigDecimal freightRate;

    private String status; // Completed, In Transit, Scheduled

    @Column(name = "goods_type")
    private String goodsType;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "customer_contact")
    private String customerContact;

    @Column(name = "eway_bill_number")
    private String ewayBillNumber;

    @Column(name = "eway_bill_expiry")
    private LocalDate ewayBillExpiry;

    @Column(name = "dispatch_date")
    private LocalDate dispatchDate;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "advance_amount")
    private BigDecimal advanceAmount;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "distance")
    private Double distance;
    
    @Column(name = "tracking_link", unique = true)
    private String trackingLink;

    @Column(name = "gst_percent")
    private Double gstPercent;

    @Column(name = "gst_amount")
    private BigDecimal gstAmount;

    @Column(name = "bilty_charge")
    private BigDecimal biltyCharge;

    @Column(name = "loading_charge")
    private BigDecimal loadingCharge;

    @Column(name = "notes")
    private String notes;
    
    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "consignor_name")
    private String consignorName;

    @Column(name = "consignor_gst")
    private String consignorGST;

    @Column(name = "consignee_name")
    private String consigneeName;

    @Column(name = "consignee_gst")
    private String consigneeGST;

    @Column(name = "consignee_contact")
    private String consigneeContact;

    @Column(name = "consignor_contact")
    private String consignorContact;

    @Column(name = "weight_unit")
    private String weightUnit; // e.g., Kg, Tons

    @Column(name = "expected_revenue")
    private BigDecimal expectedRevenue;

    @Column(name = "actual_revenue")
    private BigDecimal actualRevenue;

    @Column(name = "reconciled_costs")
    private BigDecimal reconciledCosts;

    @Column(name = "expected_margin")
    private BigDecimal expectedMargin;

    @Column(name = "actual_margin")
    private BigDecimal actualMargin;

    @Column(name = "pod_status")
    private String podStatus = "PENDING";

    @Column(name = "pod_url")
    private String podUrl;

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;

    public Trip() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTripNumber() { return tripNumber; }
    public void setTripNumber(String tripNumber) { this.tripNumber = tripNumber; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public List<LR> getLrs() { return lrs; }
    public void setLrs(List<LR> lrs) { this.lrs = lrs; }

    public List<Invoice> getInvoices() { return invoices; }
    public void setInvoices(List<Invoice> invoices) { this.invoices = invoices; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }

    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getFreightAmount() { return freightAmount; }
    public void setFreightAmount(BigDecimal freightAmount) { this.freightAmount = freightAmount; }

    public BigDecimal getFreightRate() { return freightRate; }
    public void setFreightRate(BigDecimal freightRate) { this.freightRate = freightRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getGoodsType() { return goodsType; }
    public void setGoodsType(String goodsType) { this.goodsType = goodsType; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getCustomerContact() { return customerContact; }
    public void setCustomerContact(String customerContact) { this.customerContact = customerContact; }

    public String getEwayBillNumber() { return ewayBillNumber; }
    public void setEwayBillNumber(String ewayBillNumber) { this.ewayBillNumber = ewayBillNumber; }

    public LocalDate getEwayBillExpiry() { return ewayBillExpiry; }
    public void setEwayBillExpiry(LocalDate ewayBillExpiry) { this.ewayBillExpiry = ewayBillExpiry; }

    public LocalDate getDispatchDate() { return dispatchDate; }
    public void setDispatchDate(LocalDate dispatchDate) { this.dispatchDate = dispatchDate; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public BigDecimal getAdvanceAmount() { return advanceAmount; }
    public void setAdvanceAmount(BigDecimal advanceAmount) { this.advanceAmount = advanceAmount; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public String getTrackingLink() { return trackingLink; }
    public void setTrackingLink(String trackingLink) { this.trackingLink = trackingLink; }

    public Double getGstPercent() { return gstPercent; }
    public void setGstPercent(Double gstPercent) { this.gstPercent = gstPercent; }

    public BigDecimal getGstAmount() { return gstAmount; }
    public void setGstAmount(BigDecimal gstAmount) { this.gstAmount = gstAmount; }

    public BigDecimal getBiltyCharge() { return biltyCharge; }
    public void setBiltyCharge(BigDecimal biltyCharge) { this.biltyCharge = biltyCharge; }

    public BigDecimal getLoadingCharge() { return loadingCharge; }
    public void setLoadingCharge(BigDecimal loadingCharge) { this.loadingCharge = loadingCharge; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public String getConsignorName() { return consignorName; }
    public void setConsignorName(String consignorName) { this.consignorName = consignorName; }

    public String getConsignorGST() { return consignorGST; }
    public void setConsignorGST(String consignorGST) { this.consignorGST = consignorGST; }

    public String getConsigneeName() { return consigneeName; }
    public void setConsigneeName(String consigneeName) { this.consigneeName = consigneeName; }

    public String getConsigneeGST() { return consigneeGST; }
    public void setConsigneeGST(String consigneeGST) { this.consigneeGST = consigneeGST; }

    public String getConsigneeContact() { return consigneeContact; }
    public void setConsigneeContact(String consigneeContact) { this.consigneeContact = consigneeContact; }

    public String getConsignorContact() { return consignorContact; }
    public void setConsignorContact(String consignorContact) { this.consignorContact = consignorContact; }

    public String getWeightUnit() { return weightUnit; }
    public void setWeightUnit(String weightUnit) { this.weightUnit = weightUnit; }

    public BigDecimal getExpectedRevenue() { return expectedRevenue; }
    public void setExpectedRevenue(BigDecimal expectedRevenue) { this.expectedRevenue = expectedRevenue; }

    public BigDecimal getActualRevenue() { return actualRevenue; }
    public void setActualRevenue(BigDecimal actualRevenue) { this.actualRevenue = actualRevenue; }

    public BigDecimal getReconciledCosts() { return reconciledCosts; }
    public void setReconciledCosts(BigDecimal reconciledCosts) { this.reconciledCosts = reconciledCosts; }

    public BigDecimal getExpectedMargin() { return expectedMargin; }
    public void setExpectedMargin(BigDecimal expectedMargin) { this.expectedMargin = expectedMargin; }

    public BigDecimal getActualMargin() { return actualMargin; }
    public void setActualMargin(BigDecimal actualMargin) { this.actualMargin = actualMargin; }

    public String getPodStatus() { return podStatus; }
    public void setPodStatus(String podStatus) { this.podStatus = podStatus; }

    public String getPodUrl() { return podUrl; }
    public void setPodUrl(String podUrl) { this.podUrl = podUrl; }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
}
