package com.tms.backend.controller;

import com.tms.backend.model.*;
import com.tms.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(originPatterns = "*")
@RestController
@RequestMapping("/api/v1/management")
public class ManagementController {

    @Autowired private DocumentVaultRepository documentVaultRepository;
    @Autowired private ContactMessageRepository contactMessageRepository;
    @Autowired private SystemSettingRepository systemSettingRepository;

    // --- Documents ---
    @GetMapping("/documents")
    public List<DocumentVault> getAllDocuments() { return documentVaultRepository.findAll(); }
    
    @PostMapping("/documents")
    public DocumentVault createDocument(@RequestBody DocumentVault document) { return documentVaultRepository.save(document); }
    
    @PostMapping("/documents/upload")
    public ResponseEntity<java.util.Map<String, String>> uploadDocumentFile(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            java.io.File directory = new java.io.File("uploads");
            if (!directory.exists()) {
                directory.mkdir();
            }
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath);
            
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("fileUrl", "/uploads/" + fileName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @DeleteMapping("/documents/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        return documentVaultRepository.findById(id).map(d -> {
            documentVaultRepository.delete(d);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Contact Messages ---
    @GetMapping("/contact-messages")
    public List<ContactMessage> getAllContactMessages() { return contactMessageRepository.findAll(); }
    
    @PostMapping("/contact-messages")
    public ContactMessage createContactMessage(@RequestBody ContactMessage message) { return contactMessageRepository.save(message); }
    
    @DeleteMapping("/contact-messages/{id}")
    public ResponseEntity<?> deleteContactMessage(@PathVariable Long id) {
        return contactMessageRepository.findById(id).map(m -> {
            try {
                contactMessageRepository.delete(m);
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to delete contact message: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- System Settings ---
    @GetMapping("/settings")
    public List<SystemSetting> getAllSettings() { return systemSettingRepository.findAll(); }
    
    @PostMapping("/settings")
    public SystemSetting createSetting(@RequestBody SystemSetting setting) { return systemSettingRepository.save(setting); }
    
    @DeleteMapping("/settings/{id}")
    public ResponseEntity<?> deleteSetting(@PathVariable Long id) {
        return systemSettingRepository.findById(id).map(s -> {
            systemSettingRepository.delete(s);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
