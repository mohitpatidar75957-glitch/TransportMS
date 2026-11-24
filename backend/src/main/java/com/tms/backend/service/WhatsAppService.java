package com.tms.backend.service;

import com.tms.backend.entity.WhatsAppLog;
import com.tms.backend.entity.WhatsAppTemplate;
import com.tms.backend.repository.WhatsAppLogRepository;
import com.tms.backend.repository.WhatsAppTemplateRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WhatsAppService {
    private final WhatsAppTemplateRepository templateRepository;
    private final WhatsAppLogRepository logRepository;

    public WhatsAppService(WhatsAppTemplateRepository templateRepository, WhatsAppLogRepository logRepository) {
        this.templateRepository = templateRepository;
        this.logRepository = logRepository;
    }

    public List<WhatsAppTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public WhatsAppTemplate createTemplate(WhatsAppTemplate template) {
        if (template.getActive() == null) {
            template.setActive(true);
        }
        return templateRepository.save(template);
    }

    public WhatsAppTemplate toggleTemplate(Long id) {
        Optional<WhatsAppTemplate> opt = templateRepository.findById(id);
        if (opt.isPresent()) {
            WhatsAppTemplate template = opt.get();
            template.setActive(!template.getActive());
            return templateRepository.save(template);
        }
        throw new RuntimeException("Template not found");
    }

    public List<WhatsAppLog> getLogs() {
        return logRepository.findAll();
    }

    // Mock sending message
    public WhatsAppLog simulateSendMessage(String recipient, String templateName) {
        System.out.println("Mock WhatsApp Send -> To: " + recipient + ", Template: " + templateName);
        
        WhatsAppLog log = new WhatsAppLog();
        log.setRecipientNumber(recipient);
        log.setTemplateName(templateName);
        log.setSentAt(LocalDateTime.now());
        log.setStatus("Delivered");
        
        return logRepository.save(log);
    }
}
