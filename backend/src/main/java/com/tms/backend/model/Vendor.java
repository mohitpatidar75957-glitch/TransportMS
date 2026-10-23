package com.tms.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Keeping name for backward compatibility, will act as Company Name
    
    private String contactPerson;
    
    private String mobileNumber; // Maps to contact in older schema conceptually
    
    private String email;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    private String gstin;
    
    private String pan;
    
    @Column(columnDefinition = "TEXT")
    private String bankDetails; // Store as JSON or simple text
    
    private String status; // Active, Inactive, Blocked

    @ElementCollection
    @CollectionTable(name = "vendor_services", joinColumns = @JoinColumn(name = "vendor_id"))
    @Column(name = "service")
    private List<String> services;

    private BigDecimal balance;
    
    @OneToMany(mappedBy = "vendor")
    @JsonIgnore
    private List<Vehicle> vehicles;

    @OneToMany(mappedBy = "vendor")
    @JsonIgnore
    private List<Trip> trips;
    
    @OneToMany(mappedBy = "vendor")
    @JsonIgnore
    private List<Transaction> transactions;

    @OneToMany(mappedBy = "vendor")
    @JsonIgnore
    private List<DocumentVault> documents;

    @OneToMany(mappedBy = "vendor")
    @JsonIgnore
    private List<FuelRecord> fuelRecords;

    public Vendor() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }

    public String getBankDetails() { return bankDetails; }
    public void setBankDetails(String bankDetails) { this.bankDetails = bankDetails; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getServices() { return services; }
    public void setServices(List<String> services) { this.services = services; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public List<Vehicle> getVehicles() { return vehicles; }
    public void setVehicles(List<Vehicle> vehicles) { this.vehicles = vehicles; }

    public List<Trip> getTrips() { return trips; }
    public void setTrips(List<Trip> trips) { this.trips = trips; }

    public List<Transaction> getTransactions() { return transactions; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }

    public List<DocumentVault> getDocuments() { return documents; }
    public void setDocuments(List<DocumentVault> documents) { this.documents = documents; }

    public List<FuelRecord> getFuelRecords() { return fuelRecords; }
    public void setFuelRecords(List<FuelRecord> fuelRecords) { this.fuelRecords = fuelRecords; }

    @org.hibernate.annotations.TenantId
    @Column(name = "tenant_id", nullable = true)
    private Long tenantId;

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }
}
