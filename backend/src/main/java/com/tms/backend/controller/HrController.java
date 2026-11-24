package com.tms.backend.controller;

import com.tms.backend.entity.Notification;
import com.tms.backend.entity.User;
import com.tms.backend.model.*;
import com.tms.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/hr")
public class HrController {

    @Autowired private StaffRepository staffRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private PayrollRepository payrollRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;

    // --- Managers ---
    @GetMapping("/managers")
    public List<User> getAllManagers() {
        return userRepository.findAll().stream()
            .filter(u -> "MANAGER".equalsIgnoreCase(u.getRole()) || "SUPER_ADMIN".equalsIgnoreCase(u.getRole()))
            .collect(Collectors.toList());
    }

    // --- Staff ---
    @GetMapping("/staff")
    public List<Staff> getAllStaff() { return staffRepository.findAll(); }
    
    @PostMapping("/staff")
    public Staff createStaff(@RequestBody Staff staff) { return staffRepository.save(staff); }
    
    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        return staffRepository.findById(id).map(s -> {
            staffRepository.delete(s);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Attendance ---
    @GetMapping("/attendance")
    public List<Attendance> getAllAttendance() { return attendanceRepository.findAll(); }
    
    @PostMapping("/attendance")
    public Attendance createAttendance(@RequestBody Attendance attendance) { return attendanceRepository.save(attendance); }
    
    @DeleteMapping("/attendance/{id}")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        return attendanceRepository.findById(id).map(a -> {
            attendanceRepository.delete(a);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Payroll ---
    @GetMapping("/payroll")
    public List<Payroll> getAllPayroll() { return payrollRepository.findAll(); }
    
    @PostMapping("/payroll")
    public Payroll createPayroll(@RequestBody Payroll payroll) { return payrollRepository.save(payroll); }
    
    @PutMapping("/payroll/{id}")
    public ResponseEntity<Payroll> updatePayrollStatus(@PathVariable Long id, @RequestBody Payroll payrollDetails) {
        return payrollRepository.findById(id).map(p -> {
            if (payrollDetails.getStatus() != null) p.setStatus(payrollDetails.getStatus());
            if (payrollDetails.getBaseSalary() != null) p.setBaseSalary(payrollDetails.getBaseSalary());
            if (payrollDetails.getAllowances() != null) p.setAllowances(payrollDetails.getAllowances());
            if (payrollDetails.getDeductions() != null) p.setDeductions(payrollDetails.getDeductions());
            if (payrollDetails.getNetPayable() != null) p.setNetPayable(payrollDetails.getNetPayable());
            Payroll saved = payrollRepository.save(p);

            if ("Paid".equalsIgnoreCase(payrollDetails.getStatus())) {
                try {
                    List<Notification> notifications = notificationRepository.findAll();
                    for (Notification n : notifications) {
                        if (n.getMessage() != null && n.getMessage().contains("Employee #" + p.getEmployeeId())) {
                            n.setRead(true);
                            notificationRepository.save(n);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Failed to clear notification: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/payroll/{id}")
    public ResponseEntity<?> deletePayroll(@PathVariable Long id) {
        return payrollRepository.findById(id).map(p -> {
            payrollRepository.delete(p);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
