package com.tms.backend.service;

import com.tms.backend.entity.GstInvoice;
import com.tms.backend.model.Invoice;
import com.tms.backend.repository.GstInvoiceRepository;
import com.tms.backend.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import java.util.ArrayList;

@Service
public class GstService {
    
    private final GstInvoiceRepository repository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    public GstService(GstInvoiceRepository repository) {
        this.repository = repository;
    }

    public List<GstInvoice> getAllInvoices() {
        List<GstInvoice> resultList = new ArrayList<>(repository.findAll());
        
        try {
            List<Invoice> billingInvoices = invoiceRepository.findAll();
            for (Invoice inv : billingInvoices) {
                String invNum = inv.getInvoiceNumber() != null ? inv.getInvoiceNumber() : ("INV-" + inv.getId());
                boolean exists = resultList.stream().anyMatch(g -> invNum.equalsIgnoreCase(g.getInvoiceNumber()));
                if (!exists) {
                    GstInvoice g = new GstInvoice();
                    g.setId(100000L + inv.getId());
                    g.setInvoiceNumber(invNum);
                    g.setClient(inv.getClientName() != null ? inv.getClientName() : (inv.getTrip() != null ? inv.getTrip().getClientName() : "Client"));
                    g.setDate(inv.getDate() != null ? inv.getDate() : LocalDate.now());
                    g.setAmount(inv.getAmount() != null ? inv.getAmount().doubleValue() : 0.0);
                    g.setGstPercent(5.0);
                    g.setGstAmount((g.getAmount() * 5.0) / 100.0);
                    g.setTotal(g.getAmount() + g.getGstAmount());
                    g.setType("Collected");
                    g.setStatus(inv.getStatus() != null ? inv.getStatus() : "Pending");
                    g.setGstCategory("Mixed Commodities (5%)");
                    resultList.add(g);
                }
            }
        } catch (Exception e) {
            // ignore fallback
        }

        resultList.sort(java.util.Comparator.comparing(GstInvoice::getId).reversed());
        return resultList;
    }

    public GstInvoice saveInvoice(GstInvoice invoice) {
        if (invoice.getDate() == null) {
            invoice.setDate(LocalDate.now());
        }
        if (invoice.getStatus() == null) {
            invoice.setStatus("Pending");
        }
        
        // Calculate GST amounts based on gstCategory
        if (invoice.getGstCategory() != null) {
            switch (invoice.getGstCategory()) {
                case "Fully Exempt":
                    invoice.setGstPercent(0.0);
                    break;
                case "Mixed Commodities":
                case "Multimodal (No ITC)":
                    invoice.setGstPercent(5.0);
                    break;
                case "Multimodal (With ITC)":
                    invoice.setGstPercent(12.0);
                    break;
                case "Standard (18%)":
                    invoice.setGstPercent(18.0);
                    break;
            }
        }

        if (invoice.getAmount() != null && invoice.getGstPercent() != null) {
            invoice.setGstAmount((invoice.getAmount() * invoice.getGstPercent()) / 100.0);
            invoice.setTotal(invoice.getAmount() + invoice.getGstAmount());
        }
        
        return repository.save(invoice);
    }

    public GstInvoice updateStatus(Long id, String status) {
        return repository.findById(id).map(invoice -> {
            invoice.setStatus(status);
            return repository.save(invoice);
        }).orElse(null);
    }

    public void deleteInvoice(Long id) {
        repository.deleteById(id);
    }

    @jakarta.annotation.PostConstruct
    public void initDefaultGstInvoices() {
        if (repository.count() == 0) {
            GstInvoice inv1 = new GstInvoice();
            inv1.setInvoiceNumber("GST-2024-001");
            inv1.setClient("Tata Steel Ltd");
            inv1.setDate(LocalDate.now().minusDays(4));
            inv1.setAmount(20000.0);
            inv1.setGstPercent(5.0);
            inv1.setGstAmount(1000.0);
            inv1.setTotal(21000.0);
            inv1.setType("Collected");
            inv1.setStatus("Pending");
            inv1.setGstCategory("Mixed Commodities (5%)");
            repository.save(inv1);

            GstInvoice inv2 = new GstInvoice();
            inv2.setInvoiceNumber("GST-2024-002");
            inv2.setClient("Reliance Logistics");
            inv2.setDate(LocalDate.now().minusDays(2));
            inv2.setAmount(16000.0);
            inv2.setGstPercent(5.0);
            inv2.setGstAmount(800.0);
            inv2.setTotal(16800.0);
            inv2.setType("Collected");
            inv2.setStatus("Pending");
            inv2.setGstCategory("Mixed Commodities (5%)");
            repository.save(inv2);
        }
    }

    public Map<String, Object> getGstStats() {
        List<GstInvoice> all = getAllInvoices();
        
        double totalCollected = all.stream()
                .filter(i -> "Collected".equalsIgnoreCase(i.getType()))
                .mapToDouble(i -> i.getGstAmount() != null ? i.getGstAmount() : 0.0)
                .sum();
                
        double totalPaid = all.stream()
                .filter(i -> "Paid".equalsIgnoreCase(i.getType()))
                .mapToDouble(i -> i.getGstAmount() != null ? i.getGstAmount() : 0.0)
                .sum();
                
        long pendingReturns = all.stream()
                .filter(i -> "Pending".equalsIgnoreCase(i.getStatus()))
                .count();

        double gstStatusPaid = all.stream()
                .filter(i -> "Paid".equalsIgnoreCase(i.getStatus()))
                .mapToDouble(i -> i.getGstAmount() != null ? i.getGstAmount() : (i.getTotal() != null && i.getAmount() != null ? i.getTotal() - i.getAmount() : 0.0))
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCollected", totalCollected);
        stats.put("totalPaid", totalPaid);
        stats.put("pendingReturns", pendingReturns);
        stats.put("gstStatusPaid", gstStatusPaid);
        
        return stats;
    }
}
