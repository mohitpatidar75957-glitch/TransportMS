package com.tms.backend.event;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class TripEventListener {

    // @Autowired
    // private WhatsAppService whatsAppService;
    // @Autowired
    // private InvoiceService invoiceService;

    @Async
    @EventListener
    public void handleTripCompletedEvent(TripCompletedEvent event) {
        System.out.println("TripCompletedEvent triggered for Trip ID: " + event.getTrip().getId());
        
        // 1. Automatically notify customer via WhatsApp
        // String message = "Your shipment on route " + event.getTrip().getRoute() + " has been successfully delivered.";
        // whatsAppService.sendMessage(event.getTrip().getDriver().getPhone(), message); // Example
        
        // 2. Generate Invoice automatically
        // invoiceService.generateInvoiceForTrip(event.getTrip());
        
        System.out.println("Customer notified and invoice generated (simulated).");
    }
}
