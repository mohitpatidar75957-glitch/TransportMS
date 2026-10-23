package com.tms.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/compliance/tax-calculator")
@CrossOrigin(originPatterns = "*")
public class TaxCalculatorController {

    @PostMapping("/compute")
    public ResponseEntity<?> computeTaxes(@RequestBody Map<String, Object> payload) {
        Number freightNum = (Number) payload.getOrDefault("freightAmount", 0);
        String consignorState = (String) payload.getOrDefault("consignorStateCode", "07-Delhi");
        String consigneeState = (String) payload.getOrDefault("consigneeStateCode", "27-Maharashtra");
        Boolean isRcm = (Boolean) payload.getOrDefault("isRcm", false);
        String consignorType = (String) payload.getOrDefault("consignorType", "COMPANY");
        Number gstRateNum = (Number) payload.getOrDefault("gstRate", 5.0);

        double freight = freightNum != null ? freightNum.doubleValue() : 0.0;
        double gstRate = gstRateNum != null ? gstRateNum.doubleValue() : 5.0;

        // 1. Extract State Codes (e.g., "07" from "07-Delhi")
        String code1 = consignorState.contains("-") ? consignorState.split("-")[0].trim() : consignorState.trim();
        String code2 = consigneeState.contains("-") ? consigneeState.split("-")[0].trim() : consigneeState.trim();
        boolean isInterstate = !code1.equalsIgnoreCase(code2);

        // 2. Compute GST
        double cgstRate = 0.0, sgstRate = 0.0, igstRate = 0.0;
        double cgstAmount = 0.0, sgstAmount = 0.0, igstAmount = 0.0, totalGst = 0.0;

        if (Boolean.TRUE.equals(isRcm)) {
            // RCM: GTA charges 0% tax on invoice, Receiver pays to govt directly under Sec 9(3)
            cgstRate = 0; sgstRate = 0; igstRate = 0;
            cgstAmount = 0; sgstAmount = 0; igstAmount = 0; totalGst = 0;
        } else {
            if (isInterstate) {
                igstRate = gstRate;
                igstAmount = (freight * igstRate) / 100.0;
                totalGst = igstAmount;
            } else {
                cgstRate = gstRate / 2.0;
                sgstRate = gstRate / 2.0;
                cgstAmount = (freight * cgstRate) / 100.0;
                sgstAmount = (freight * sgstRate) / 100.0;
                totalGst = cgstAmount + sgstAmount;
            }
        }

        // 3. TDS Under Section 194C Deduction
        double tdsRate = 0.0;
        if ("INDIVIDUAL".equalsIgnoreCase(consignorType) || "HUF".equalsIgnoreCase(consignorType)) {
            tdsRate = 1.0;
        } else if ("COMPANY".equalsIgnoreCase(consignorType) || "FIRM".equalsIgnoreCase(consignorType) || "PVT_LTD".equalsIgnoreCase(consignorType)) {
            tdsRate = 2.0;
        }

        double tdsAmount = (freight * tdsRate) / 100.0;
        double grandTotal = freight + totalGst;
        double netPayable = grandTotal - tdsAmount;

        Map<String, Object> res = new java.util.LinkedHashMap<>();
        res.put("freightAmount", round(freight));
        res.put("consignorState", consignorState);
        res.put("consigneeState", consigneeState);
        res.put("isInterstate", isInterstate);
        res.put("isRcm", Boolean.TRUE.equals(isRcm));
        res.put("gstRate", gstRate);
        res.put("cgstRate", cgstRate);
        res.put("sgstRate", sgstRate);
        res.put("igstRate", igstRate);
        res.put("cgstAmount", round(cgstAmount));
        res.put("sgstAmount", round(sgstAmount));
        res.put("igstAmount", round(igstAmount));
        res.put("totalGst", round(totalGst));
        res.put("grandTotal", round(grandTotal));
        res.put("tdsSection", "194C");
        res.put("consignorType", consignorType.toUpperCase());
        res.put("tdsRate", tdsRate);
        res.put("tdsAmount", round(tdsAmount));
        res.put("netPayable", round(netPayable));
        res.put("rcmNote", Boolean.TRUE.equals(isRcm) ? "Tax Payable under Reverse Charge: YES (Sec 9(3))" : "Tax Payable under Reverse Charge: NO");
        res.put("gstNote", isInterstate ? "Inter-State Supply (IGST Applicable)" : "Intra-State Supply (CGST + SGST Applicable)");
        return ResponseEntity.ok(res);
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
