package com.tms.backend.controller;

import com.tms.backend.model.*;
import com.tms.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/finance")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER')")
public class FinanceController {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private LoanRepository loanRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private com.tms.backend.service.AuditService auditService;
    @Autowired private com.tms.backend.service.ExpenseService expenseService;

    // --- Invoices ---
    @GetMapping("/invoices")
    public List<Invoice> getAllInvoices() { return invoiceRepository.findAll(); }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<?> getInvoiceById(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- Payments / Part-Payments ---
    @GetMapping("/invoices/{id}/payments")
    public ResponseEntity<List<Payment>> getInvoicePayments(@PathVariable Long id) {
        return ResponseEntity.ok(paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(id));
    }

    @PostMapping("/invoices/{id}/payments")
    public ResponseEntity<?> addPaymentToInvoice(
            @PathVariable Long id,
            @RequestBody Payment payment,
            @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        
        return invoiceRepository.findById(id).map(invoice -> {
            payment.setInvoice(invoice);
            if (payment.getPaymentDate() == null) {
                payment.setPaymentDate(java.time.LocalDate.now());
            }
            if (payment.getPaymentReference() == null || payment.getPaymentReference().trim().isEmpty()) {
                payment.setPaymentReference("PAY-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000));
            }
            if (payment.getPaymentMode() == null || payment.getPaymentMode().trim().isEmpty()) {
                payment.setPaymentMode("UPI");
            }

            Payment savedPayment = paymentRepository.save(payment);

            // Record transaction credit
            try {
                Transaction t = new Transaction();
                t.setDate(payment.getPaymentDate());
                t.setType("Credit");
                t.setAmount(payment.getAmount());
                t.setDescription("Part-payment received (" + payment.getPaymentMode() + ") for Invoice " + invoice.getInvoiceNumber() + " Ref: " + savedPayment.getPaymentReference());
                transactionRepository.save(t);
            } catch (Exception ex) {}

            // Recalculate total payments for this invoice
            List<Payment> allPayments = paymentRepository.findByInvoiceId(id);
            java.math.BigDecimal totalPaid = allPayments.stream()
                    .map(Payment::getAmount)
                    .filter(java.util.Objects::nonNull)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            java.math.BigDecimal invTotal = invoice.getAmount() != null ? invoice.getAmount() : java.math.BigDecimal.ZERO;
            if (invoice.getTdsAmount() != null) {
                invTotal = invTotal.subtract(invoice.getTdsAmount());
            }

            String oldStatus = invoice.getStatus();
            if (totalPaid.compareTo(invTotal) >= 0) {
                invoice.setStatus("Paid");
            } else if (totalPaid.compareTo(java.math.BigDecimal.ZERO) > 0) {
                invoice.setStatus("Partially Paid");
            } else {
                invoice.setStatus("Unpaid");
            }
            invoiceRepository.save(invoice);

            auditService.logAction(roleHeader, "INVOICE_PAYMENT", invoice.getInvoiceNumber(), "PAYMENT_ADDED", 
                    oldStatus, invoice.getStatus(), 
                    "Added part-payment ₹" + savedPayment.getAmount() + " via " + savedPayment.getPaymentMode() + ". New Status: " + invoice.getStatus());

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("payment", savedPayment);
            response.put("totalPaid", totalPaid);
            response.put("invoiceStatus", invoice.getStatus());
            response.put("balancePending", invTotal.subtract(totalPaid).max(java.math.BigDecimal.ZERO));
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/invoices")
    public Invoice createInvoice(@RequestBody Invoice invoice, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) { 
        Invoice saved = invoiceRepository.save(invoice);
        String invNo = saved.getInvoiceNumber() != null ? saved.getInvoiceNumber() : ("INV-" + saved.getId());
        String amountStr = "₹" + (saved.getAmount() != null ? saved.getAmount() : 0);
        auditService.logAction(roleHeader, "INVOICE", invNo, "CREATED", null, amountStr, "Created new invoice " + invNo + " for amount " + amountStr);
        return saved;
    }

    @PutMapping("/invoices/{id}")
    public ResponseEntity<?> updateInvoice(@PathVariable Long id, @RequestBody Invoice updated, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return invoiceRepository.findById(id).map(existing -> {
            String invNo = existing.getInvoiceNumber() != null ? existing.getInvoiceNumber() : ("INV-" + existing.getId());
            String oldAmountStr = "₹" + (existing.getAmount() != null ? existing.getAmount() : 0);
            String newAmountStr = "₹" + (updated.getAmount() != null ? updated.getAmount() : 0);

            existing.setAmount(updated.getAmount());
            if (updated.getDate() != null) existing.setDate(updated.getDate());
            if (updated.getClientName() != null) existing.setClientName(updated.getClientName());
            if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
            if (updated.getInvoiceNumber() != null) existing.setInvoiceNumber(updated.getInvoiceNumber());

            Invoice saved = invoiceRepository.save(existing);
            auditService.logAction(roleHeader, "INVOICE", invNo, "EDITED", oldAmountStr, newAmountStr, "Edited invoice " + invNo + " amount from " + oldAmountStr + " to " + newAmountStr);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return invoiceRepository.findById(id).map(i -> {
            String invNo = i.getInvoiceNumber() != null ? i.getInvoiceNumber() : ("INV-" + i.getId());
            String amountStr = "₹" + (i.getAmount() != null ? i.getAmount() : 0);
            invoiceRepository.delete(i);
            auditService.logAction(roleHeader, "INVOICE", invNo, "DELETED", amountStr, null, "Deleted invoice " + invNo + " (Amount: " + amountStr + ")");
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/invoices/{id}/status")
    public ResponseEntity<?> updateInvoiceStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return invoiceRepository.findById(id).map(invoice -> {
            String oldStatus = invoice.getStatus() != null ? invoice.getStatus() : "Pending";
            String newStatus = body.get("status");
            String invNo = invoice.getInvoiceNumber() != null ? invoice.getInvoiceNumber() : ("INV-" + invoice.getId());

            if ("Paid".equalsIgnoreCase(newStatus) && !"Paid".equalsIgnoreCase(invoice.getStatus())) {
                Transaction t = new Transaction();
                t.setDate(java.time.LocalDate.now());
                t.setType("Credit");
                t.setAmount(invoice.getAmount());
                t.setDescription("Payment received for Invoice " + invNo);
                transactionRepository.save(t);
            }
            invoice.setStatus(newStatus);
            Invoice saved = invoiceRepository.save(invoice);
            auditService.logAction(roleHeader, "INVOICE", invNo, "STATUS_CHANGED", oldStatus, newStatus, "Updated invoice " + invNo + " status from " + oldStatus + " to " + newStatus);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Expenses ---
    @GetMapping("/expenses")
    public List<Expense> getAllExpenses() { return expenseRepository.findAll(); }
    
    @PostMapping("/expenses")
    public Expense createExpense(@RequestBody Expense expense, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) { 
        Expense saved = expenseService.processAndSaveExpense(expense); 
        try {
            String newVal = saved.getCategory() + " (₹" + saved.getAmount() + ")";
            auditService.logAction(roleHeader, "Expense", saved.getId(), "CREATED", null, newVal, "Created expense #" + saved.getId() + " under " + saved.getCategory());
        } catch (Exception ignored) {}
        return saved;
    }

    @GetMapping("/expenses/check-anomaly")
    public java.util.Map<String, Object> checkExpenseAnomaly(
            @RequestParam String category, 
            @RequestParam Double amount, 
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) Long tripId) {
        return expenseService.checkExpenseAnomaly(category, amount, vehicleId, tripId);
    }
    
    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return expenseRepository.findById(id).map(e -> {
            String oldVal = e.getCategory() + " (₹" + e.getAmount() + ")";
            expenseRepository.delete(e);
            try {
                auditService.logAction(roleHeader, "Expense", id, "DELETED", oldVal, null, "Deleted expense #" + id + " (" + oldVal + ")");
            } catch (Exception ignored) {}
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Loans ---
    @GetMapping("/loans")
    public List<Loan> getAllLoans() { return loanRepository.findAll(); }
    
    @PostMapping("/loans")
    public Loan createLoan(@RequestBody Loan loan, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) { 
        Loan saved = loanRepository.save(loan);
        try {
            String newVal = (saved.getBankName() != null ? saved.getBankName() : "Loan") + " (₹" + saved.getAmount() + ")";
            auditService.logAction(roleHeader, "Loan", saved.getId(), "CREATED", null, newVal, "Created loan for " + (saved.getBankName() != null ? saved.getBankName() : "Loan"));
        } catch (Exception ignored) {}
        return saved;
    }
    
    @DeleteMapping("/loans/{id}")
    public ResponseEntity<?> deleteLoan(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return loanRepository.findById(id).map(l -> {
            String oldVal = (l.getBankName() != null ? l.getBankName() : "Loan") + " (₹" + l.getAmount() + ")";
            loanRepository.delete(l);
            try {
                auditService.logAction(roleHeader, "Loan", id, "DELETED", oldVal, null, "Deleted loan #" + id);
            } catch (Exception ignored) {}
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Transactions ---
    @GetMapping("/transactions")
    public List<Transaction> getAllTransactions() { return transactionRepository.findAll(); }
    
    @PostMapping("/transactions")
    public Transaction createTransaction(@RequestBody Transaction transaction, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) { 
        Transaction saved = transactionRepository.save(transaction);
        try {
            String newVal = saved.getType() + " (₹" + saved.getAmount() + ") - " + (saved.getDescription() != null ? saved.getDescription() : "");
            auditService.logAction(roleHeader, "Transaction", saved.getId(), "CREATED", null, newVal, "Recorded " + saved.getType() + " transaction of ₹" + saved.getAmount());
        } catch (Exception ignored) {}
        return saved;
    }
    
    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, @RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        return transactionRepository.findById(id).map(t -> {
            String oldVal = t.getType() + " (₹" + t.getAmount() + ") - " + (t.getDescription() != null ? t.getDescription() : "");
            transactionRepository.delete(t);
            try {
                auditService.logAction(roleHeader, "Transaction", id, "DELETED", oldVal, null, "Deleted transaction #" + id);
            } catch (Exception ignored) {}
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
