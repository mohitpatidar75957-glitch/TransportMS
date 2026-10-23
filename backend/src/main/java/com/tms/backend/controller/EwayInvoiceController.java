package com.tms.backend.controller;

import com.tms.backend.model.Invoice;
import com.tms.backend.model.Trip;
import com.tms.backend.repository.InvoiceRepository;
import com.tms.backend.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/compliance")
@CrossOrigin(originPatterns = "*")
public class EwayInvoiceController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private com.tms.backend.service.GstGovtPortalService gstGovtPortalService;

    /**
     * Test Connection with Government GST/E-Way Portal Gateway
     */
    @GetMapping("/govt-portal/test-connection")
    public ResponseEntity<?> testGovtPortalConnection() {
        return ResponseEntity.ok(gstGovtPortalService.testConnection());
    }

    /**
     * Get Government GST/E-Way Portal Configuration
     */
    @GetMapping("/govt-portal/config")
    public ResponseEntity<?> getGovtPortalConfig() {
        return ResponseEntity.ok(gstGovtPortalService.getGovtPortalConfig());
    }

    /**
     * Direct 1-Click Government Portal API Integration (E-Way Bill)
     * Direct live token authenticated connection with NIC/GSP API.
     * Distance Rule: 1 Day validity per 200 KM (minimum 1 day)
     */
    @PostMapping("/eway-bill/generate")
    public ResponseEntity<?> generateEWayBill(@RequestBody Map<String, Object> payload) {
        Number tripIdNum = (Number) payload.get("tripId");
        Number distanceNum = (Number) payload.get("distanceKm");
        String consignorGst = (String) payload.get("consignorGst");
        String consigneeGst = (String) payload.get("consigneeGst");
        String vehicleNumber = (String) payload.get("vehicleNumber");

        if (tripIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "tripId is required"));
        }

        Trip trip = tripRepository.findById(tripIdNum.longValue()).orElse(null);
        if (trip == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Trip not found with ID: " + tripIdNum));
        }

        // Compliance Rule: E-Way Bills are transit/dispatch documents and cannot be generated for completed/delivered trips.
        String status = trip.getStatus() != null ? trip.getStatus().trim().toUpperCase() : "";
        if ("COMPLETED".equals(status) || "DELIVERED".equals(status)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Cannot generate E-Way Bill for a trip that is already marked '" + trip.getStatus() + "'. E-Way Bills are transit permits and can only be issued before or during active transit (Planned, In Transit, Dispatched)."
            ));
        }

        double distance = distanceNum != null ? distanceNum.doubleValue() : (trip.getDistance() != null ? trip.getDistance() : 250.0);
        String cgst = (consignorGst != null && !consignorGst.isBlank()) ? consignorGst : (trip.getConsignorGST() != null ? trip.getConsignorGST() : "23AADCR1234F1Z5");
        String bgst = (consigneeGst != null && !consigneeGst.isBlank()) ? consigneeGst : (trip.getConsigneeGST() != null ? trip.getConsigneeGST() : "24AAACG5678B1Z2");

        // Execute Direct Live E-Way bill generation via GSP / NIC Gateway
        Map<String, Object> gatewayResponse = gstGovtPortalService.generateLiveEwayBill(trip, distance, cgst, bgst, vehicleNumber);

        String ewayBillNo = (String) gatewayResponse.get("ewayBillNumber");
        String expiryDateStr = (String) gatewayResponse.get("ewayBillExpiry");
        LocalDate expiryDate = LocalDate.parse(expiryDateStr.substring(0, 10));

        // Update Trip
        trip.setEwayBillNumber(ewayBillNo);
        trip.setEwayBillExpiry(expiryDate);
        trip.setConsignorGST(cgst);
        trip.setConsigneeGST(bgst);
        tripRepository.save(trip);

        gatewayResponse.put("tripNumber", trip.getTripNumber());
        return ResponseEntity.ok(gatewayResponse);
    }

    /**
     * Direct E-Invoice (IRN & QR Code Generation) via GST IRP Portal API
     * Embeds authentic 64-character IRN, 15-digit Ack No, and Signed QR code.
     */
    @PostMapping("/einvoice/generate")
    public ResponseEntity<?> generateEInvoice(@RequestBody Map<String, Object> payload) {
        Number invoiceIdNum = (Number) payload.get("invoiceId");
        String consignorGst = (String) payload.getOrDefault("consignorGst", "23AADCR1234F1Z5");
        String consigneeGst = (String) payload.getOrDefault("consigneeGst", "24AAACG5678B1Z2");
        String hsnCode = (String) payload.getOrDefault("hsnCode", "996511");

        if (invoiceIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "invoiceId is required"));
        }

        Invoice invoice = invoiceRepository.findById(invoiceIdNum.longValue()).orElse(null);
        if (invoice == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invoice not found with ID: " + invoiceIdNum));
        }

        // Generate authentic E-Invoice via GstGovtPortalService (IRP Engine)
        Map<String, Object> irpResponse = gstGovtPortalService.generateLiveEInvoice(invoice, consignorGst, consigneeGst, hsnCode);

        String irnHash = (String) irpResponse.get("irn");
        String ackNo = (String) irpResponse.get("ackNumber");
        String ackDate = (String) irpResponse.get("ackDate");
        String qrCodeData = (String) irpResponse.get("qrCodeData");

        // Save to Invoice Entity
        invoice.setIrn(irnHash);
        invoice.setAckNumber(ackNo);
        invoice.setAckDate(LocalDateTime.now());
        invoice.setQrCodeData(qrCodeData);
        invoice.setEinvoiceStatus("GENERATED");
        invoice.setHsnCode(hsnCode);
        invoice.setConsignorGst(consignorGst);
        invoice.setConsigneeGst(consigneeGst);

        // If trip is attached and has eway bill, sync it
        if (invoice.getTrip() != null && invoice.getTrip().getEwayBillNumber() != null) {
            invoice.setEwayBillNumber(invoice.getTrip().getEwayBillNumber());
        }

        invoiceRepository.save(invoice);

        irpResponse.put("einvoiceStatus", "GENERATED");
        return ResponseEntity.ok(irpResponse);
    }

    /**
     * Export Official NIC Government E-Way Bill JSON (EWB-01 Format) for direct portal upload
     */
    @GetMapping("/eway-bill/{tripIdStr}/export/json")
    public ResponseEntity<?> exportEwayBillJson(@PathVariable String tripIdStr) {
        Trip trip = null;
        try {
            Long numericId = Long.parseLong(tripIdStr.replace("TRP-DB-", "").replace("TRP-", "").trim());
            trip = tripRepository.findById(numericId).orElse(null);
        } catch (Exception ignored) {}

        if (trip == null) {
            trip = tripRepository.findAll().stream()
                    .filter(t -> tripIdStr.equalsIgnoreCase(t.getTripNumber()) || ("TRP-DB-" + t.getId()).equalsIgnoreCase(tripIdStr))
                    .findFirst()
                    .orElse(null);
        }

        if (trip == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Trip not found with ID/Number: " + tripIdStr));
        }

        String consignorGst = (trip.getConsignorGST() != null && !trip.getConsignorGST().isBlank()) ? trip.getConsignorGST() : "27AAACG0123M1Z5";
        String consigneeGst = (trip.getConsigneeGST() != null && !trip.getConsigneeGST().isBlank()) ? trip.getConsigneeGST() : "24AAACG5678B1Z2";
        String docNo = trip.getTripNumber() != null ? trip.getTripNumber() : ("TRP-" + trip.getId());
        String docDate = trip.getStartDate() != null ? trip.getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String vehicleNo = trip.getVehicle() != null ? trip.getVehicle().getRegistrationNumber() : "MH04AB1234";
        double totalVal = trip.getFreightAmount() != null ? trip.getFreightAmount().doubleValue() : 50000.0;
        double cgstVal = totalVal * 0.025;
        double sgstVal = totalVal * 0.025;
        double distance = trip.getDistance() != null ? trip.getDistance() : 250.0;

        // Official National Informatics Centre (NIC) E-Way Bill JSON Payload Structure
        Map<String, Object> ewayBillJson = new java.util.LinkedHashMap<>();
        ewayBillJson.put("supplyType", "O"); // Outward supply
        ewayBillJson.put("subSupplyType", "1"); // Supply
        ewayBillJson.put("subSupplyDesc", "");
        ewayBillJson.put("docType", "INV"); // Tax Invoice
        ewayBillJson.put("docNo", docNo);
        ewayBillJson.put("docDate", docDate);

        // Parse Route (Supports "indore -> bhopal", "indore -> bhopal", "mumbai -> ahmedabad", etc.)
        String fromPlace = "Indore";
        String toPlace = "Bhopal";
        if (trip.getRoute() != null && !trip.getRoute().isBlank()) {
            String cleanRoute = trip.getRoute().replace("→", "->").replace("—", "-");
            if (cleanRoute.contains("->")) {
                String[] parts = cleanRoute.split("->");
                if (parts.length > 0 && !parts[0].trim().isEmpty()) fromPlace = parts[0].trim();
                if (parts.length > 1 && !parts[1].trim().isEmpty()) toPlace = parts[1].trim();
            } else if (cleanRoute.contains("-")) {
                String[] parts = cleanRoute.split("-");
                if (parts.length > 0 && !parts[0].trim().isEmpty()) fromPlace = parts[0].trim();
                if (parts.length > 1 && !parts[1].trim().isEmpty()) toPlace = parts[1].trim();
            } else {
                fromPlace = trip.getRoute().trim();
            }
        }

        String consignorName = trip.getConsignorName();
        if (consignorName == null || consignorName.isBlank()) {
            consignorName = "RK Transport Logistics";
        }

        String consigneeName = trip.getConsigneeName();
        if (consigneeName == null || consigneeName.isBlank()) {
            consigneeName = (trip.getClientName() != null && !trip.getClientName().isBlank()) ? trip.getClientName() : "Consignee Logistics";
        }

        String fromAddress = (trip.getPickupAddress() != null && !trip.getPickupAddress().isBlank()) ? trip.getPickupAddress() : (fromPlace + " Transport Hub, Phase 1");
        String toAddress = (trip.getDeliveryAddress() != null && !trip.getDeliveryAddress().isBlank()) ? trip.getDeliveryAddress() : (toPlace + " Industrial Area, Sector 2");

        // From / Consignor Details
        Map<String, Object> fromTrd = new java.util.LinkedHashMap<>();
        fromTrd.put("fromGstin", consignorGst);
        fromTrd.put("fromTrdName", consignorName);
        fromTrd.put("fromAddr1", fromAddress);
        fromTrd.put("fromPlace", fromPlace);
        fromTrd.put("fromPincode", 452001); // Standard default or extracted
        fromTrd.put("actFromStateCode", 23); // MP state code (or 27 if MH)
        fromTrd.put("fromStateCode", 23);
        ewayBillJson.put("fromTrdDetails", fromTrd);

        // To / Consignee Details
        Map<String, Object> toTrd = new java.util.LinkedHashMap<>();
        toTrd.put("toGstin", consigneeGst);
        toTrd.put("toTrdName", consigneeName);
        toTrd.put("toAddr1", toAddress);
        toTrd.put("toPlace", toPlace);
        toTrd.put("toPincode", 462001);
        toTrd.put("actToStateCode", 23);
        toTrd.put("toStateCode", 23);
        ewayBillJson.put("toTrdDetails", toTrd);

        // Value / Taxes
        ewayBillJson.put("totalValue", totalVal);
        ewayBillJson.put("cgstValue", cgstVal);
        ewayBillJson.put("sgstValue", sgstVal);
        ewayBillJson.put("igstValue", 0.0);
        ewayBillJson.put("cessValue", 0.0);
        ewayBillJson.put("totInvValue", Math.round((totalVal + cgstVal + sgstVal) * 100.0) / 100.0);

        // Item List (Transport / Goods HSN 996511)
        Map<String, Object> item = new java.util.LinkedHashMap<>();
        item.put("itemNo", 1);
        item.put("productName", (trip.getGoodsType() != null && !trip.getGoodsType().isBlank()) ? trip.getGoodsType() : "Freight Transport Logistics");
        item.put("productDesc", "Road Freight Transportation Services");
        item.put("hsnCode", 996511);
        item.put("quantity", trip.getWeight() != null && trip.getWeight() > 0 ? trip.getWeight() : 1.0);
        item.put("qtyUnit", "MTS");
        item.put("taxableAmount", totalVal);
        item.put("cgstRate", 2.5);
        item.put("sgstRate", 2.5);
        item.put("igstRate", 0.0);
        item.put("cessRate", 0.0);
        ewayBillJson.put("itemList", List.of(item));

        // Transporter & Vehicle Details (Part B)
        Map<String, Object> vehDetails = new java.util.LinkedHashMap<>();
        vehDetails.put("updMode", "1");
        vehDetails.put("transMode", "1"); // Road
        vehDetails.put("transDistance", (int) distance);
        vehDetails.put("transporterName", "RK Transport & Logistics");
        vehDetails.put("transDocNo", trip.getTripNumber() != null ? trip.getTripNumber() : ("TRP-" + trip.getId()));
        vehDetails.put("transDocDate", docDate);
        vehDetails.put("vehicleNo", vehicleNo);
        vehDetails.put("vehicleType", "R"); // Regular
        ewayBillJson.put("vehiclListDetails", List.of(vehDetails));

        // E-Way Bill Number if already assigned
        if (trip.getEwayBillNumber() != null) {
            ewayBillJson.put("ewayBillNo", trip.getEwayBillNumber());
            ewayBillJson.put("validUpto", trip.getEwayBillExpiry() != null ? trip.getEwayBillExpiry().toString() : "");
        }

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"eway_bill_" + docNo + ".json\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/json")
                .body(ewayBillJson);
    }

    /**
     * Get Invoice E-Invoicing & E-Way Bill Compliance Status
     */
    @GetMapping("/invoice/{id}")
    public ResponseEntity<?> getInvoiceCompliance(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id).orElse(null);
        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("id", invoice.getId());
        response.put("invoiceNumber", invoice.getInvoiceNumber() != null ? invoice.getInvoiceNumber() : "");
        response.put("clientName", invoice.getClientName() != null ? invoice.getClientName() : "");
        response.put("amount", invoice.getAmount());
        response.put("einvoiceStatus", invoice.getEinvoiceStatus() != null ? invoice.getEinvoiceStatus() : "NOT_GENERATED");
        response.put("irn", invoice.getIrn() != null ? invoice.getIrn() : "");
        response.put("ackNumber", invoice.getAckNumber() != null ? invoice.getAckNumber() : "");
        response.put("ackDate", invoice.getAckDate() != null ? invoice.getAckDate().toString() : "");
        response.put("qrCodeData", invoice.getQrCodeData() != null ? invoice.getQrCodeData() : "");
        response.put("hsnCode", invoice.getHsnCode() != null ? invoice.getHsnCode() : "996511");
        response.put("ewayBillNumber", invoice.getEwayBillNumber() != null ? invoice.getEwayBillNumber() : (invoice.getTrip() != null ? invoice.getTrip().getEwayBillNumber() : ""));
        response.put("tripId", invoice.getTrip() != null ? invoice.getTrip().getId() : null);
        return ResponseEntity.ok(response);
    }

    private String generateSha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            return "4b8f9a2e61c30d9715e4a781b2c5d6e7f809123456789abcdef0123456789abc";
        }
    }
}
