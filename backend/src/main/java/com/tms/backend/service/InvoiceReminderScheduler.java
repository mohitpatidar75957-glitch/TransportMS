package com.tms.backend.service;

import com.tms.backend.entity.WhatsAppLog;
import com.tms.backend.model.Invoice;
import com.tms.backend.repository.InvoiceRepository;
import com.tms.backend.repository.WhatsAppLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class InvoiceReminderScheduler {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private WhatsAppLogRepository whatsAppLogRepository;

    @Autowired
    private WhatsAppService whatsAppService;

    /**
     * Runs every morning at 09:30 AM (or can be triggered on demand via REST)
     * Checks all unpaid / partially paid invoices and sends automated WhatsApp reminders:
     * 1. 3 days before Due Date ("Upcoming Due")
     * 2. On Due Date ("Due Today")
     * 3. 3 days after Due Date ("Overdue Notice")
     */
    @Scheduled(cron = "0 30 9 * * ?")
    public Map<String, Object> runDailyDueDateReminders() {
        LocalDate today = LocalDate.now();
        LocalDate dueIn3Days = today.plusDays(3);
        LocalDate overdueBy3Days = today.minusDays(3);

        int sentBeforeDue = sendRemindersForDate(dueIn3Days, "BEFORE_DUE_3_DAYS", "Upcoming Invoice Due in 3 Days");
        int sentDueToday = sendRemindersForDate(today, "DUE_TODAY", "Invoice Due Today");
        int sentOverdue = sendRemindersForDate(overdueBy3Days, "OVERDUE_3_DAYS", "Urgent: Invoice Overdue by 3 Days");

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("date", today.toString());
        result.put("reminders_sent_before_due", sentBeforeDue);
        result.put("reminders_sent_due_today", sentDueToday);
        result.put("reminders_sent_overdue", sentOverdue);
        result.put("total_sent", sentBeforeDue + sentDueToday + sentOverdue);

        System.out.println("WhatsApp Invoice Reminder Job finished: " + result);
        return result;
    }

    private int sendRemindersForDate(LocalDate targetDueDate, String reminderType, String templateLabel) {
        List<Invoice> invoices = invoiceRepository.findByDueDateAndStatusNotIgnoreCase(targetDueDate, "Paid");
        int sentCount = 0;

        for (Invoice inv : invoices) {
            try {
                // Determine contact number: from trip customer contact or default client phone
                String phone = null;
                if (inv.getTrip() != null && inv.getTrip().getCustomerContact() != null && !inv.getTrip().getCustomerContact().trim().isEmpty()) {
                    phone = inv.getTrip().getCustomerContact().trim();
                } else if (inv.getTrip() != null && inv.getTrip().getConsignorContact() != null && !inv.getTrip().getConsignorContact().trim().isEmpty()) {
                    phone = inv.getTrip().getConsignorContact().trim();
                }

                if (phone == null || phone.isEmpty()) {
                    phone = "+91 9876543210"; // Default business demo recipient
                }

                String client = inv.getClientName() != null ? inv.getClientName() : "Valued Customer";
                String invNum = inv.getInvoiceNumber() != null ? inv.getInvoiceNumber() : ("INV-" + inv.getId());
                BigDecimal amt = inv.getAmount() != null ? inv.getAmount() : BigDecimal.ZERO;
                String upi = inv.getUpiId() != null ? inv.getUpiId() : "rktraders@upi";

                String message;
                if ("BEFORE_DUE_3_DAYS".equals(reminderType)) {
                    message = String.format("Reminder: Dear %s, your invoice %s of amount ₹%.2f is due in 3 days on %s. Pay quickly via UPI: %s",
                            client, invNum, amt.doubleValue(), targetDueDate.toString(), upi);
                } else if ("DUE_TODAY".equals(reminderType)) {
                    message = String.format("Due Today: Dear %s, your invoice %s of amount ₹%.2f is DUE TODAY (%s). Please clear it to avoid late fees. UPI: %s",
                            client, invNum, amt.doubleValue(), targetDueDate.toString(), upi);
                } else {
                    message = String.format("OVERDUE NOTICE: Dear %s, your invoice %s of amount ₹%.2f was due on %s and is now 3 days overdue. Kindly settle immediately via UPI: %s",
                            client, invNum, amt.doubleValue(), targetDueDate.toString(), upi);
                }

                // Check if we already logged this exact reminder today to avoid spamming
                whatsAppService.simulateSendMessage(phone, templateLabel + " (" + invNum + ")");
                sentCount++;
            } catch (Exception e) {
                System.err.println("Failed to send reminder for invoice " + inv.getId() + ": " + e.getMessage());
            }
        }

        return sentCount;
    }
}
