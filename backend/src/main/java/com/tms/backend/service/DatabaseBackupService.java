package com.tms.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class DatabaseBackupService {

    @Value("${spring.datasource.username:root}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    // Run every day at 2:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void backupDatabase() {
        System.out.println("Starting automatic database backup...");
        
        String dbName = "tms-db"; 
        if (dbUrl.contains("/")) {
            String[] parts = dbUrl.split("\\?")[0].split("/");
            dbName = parts[parts.length - 1];
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String backupFileName = "backup_" + dbName + "_" + timestamp + ".sql";
        String backupDir = "backups";
        
        File dir = new File(backupDir);
        if (!dir.exists()) {
            dir.mkdir();
        }

        // We use mysqldump to back up the database
        String executeCmd = String.format("mysqldump -u%s -p%s --add-drop-table --databases %s -r %s", 
                username, password, dbName, backupDir + "/" + backupFileName);

        try {
            Process runtimeProcess = Runtime.getRuntime().exec(executeCmd);
            int processComplete = runtimeProcess.waitFor();

            if (processComplete == 0) {
                System.out.println("Backup created successfully: " + backupFileName);
            } else {
                System.err.println("Could not create the backup");
            }
        } catch (IOException | InterruptedException ex) {
            System.err.println("Error during database backup: " + ex.getMessage());
        }
    }
}
