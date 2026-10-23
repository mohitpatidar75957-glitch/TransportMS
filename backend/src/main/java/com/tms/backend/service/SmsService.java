package com.tms.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    // You will provide these later in application.properties
    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    @org.springframework.scheduling.annotation.Async
    public void sendOtp(String toPhoneNumber, String otp) {
        if (accountSid == null || accountSid.isEmpty()) {
            System.out.println("Twilio not configured. OTP generated for " + toPhoneNumber + " is: " + otp);
            return; // Skip actual sending if keys are missing
        }

        try {
            System.out.println("========== SECURITY ALERT ==========");
            System.out.println("Generated OTP for " + toPhoneNumber + " is: " + otp);
            System.out.println("====================================");

            Twilio.init(accountSid, authToken);
            Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    "Your TMS Login OTP is: " + otp + ". Do not share this with anyone."
            ).create();
            System.out.println("OTP successfully sent via Twilio to " + toPhoneNumber);
        } catch (Exception e) {
            System.err.println("Failed to send OTP via Twilio: " + e.getMessage());
            System.err.println("Make sure the number is verified in your Twilio Trial account.");
        }
    }

    @org.springframework.scheduling.annotation.Async
    public void sendAlert(String toPhoneNumber, String alertMessage) {
        if (toPhoneNumber == null || toPhoneNumber.isBlank()) return;

        System.out.println("🚨 [CRITICAL WATCHDOG SMS ALERT] To: " + toPhoneNumber + " -> " + alertMessage);

        if (accountSid == null || accountSid.isEmpty() || twilioPhoneNumber == null || twilioPhoneNumber.isEmpty()) {
            System.out.println("⚠️ Twilio credentials missing. Simulated SMS alert logged successfully.");
            return;
        }

        try {
            Twilio.init(accountSid, authToken);
            Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    "🚨 [TMS UPTIME WATCHDOG ALERT] " + alertMessage
            ).create();
            System.out.println("✅ Watchdog SMS alert successfully dispatched to admin: " + toPhoneNumber);
        } catch (Exception e) {
            System.err.println("Failed to send Watchdog SMS via Twilio: " + e.getMessage());
        }
    }
}
