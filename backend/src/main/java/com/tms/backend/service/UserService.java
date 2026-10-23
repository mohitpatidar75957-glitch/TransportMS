package com.tms.backend.service;

import com.tms.backend.entity.User;
import com.tms.backend.model.Driver;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user, String creatorRole) {
        if ("SUPER_ADMIN".equals(creatorRole) || "MANAGER".equals(creatorRole)) {
            if ("MANAGER".equals(creatorRole) && ("SUPER_ADMIN".equals(user.getRole()) || "MANAGER".equals(user.getRole()))) {
                throw new RuntimeException("Access Denied: Managers can only register Drivers or Customers, not Manager or Admin accounts.");
            }
            if ("SUPER_ADMIN".equals(user.getRole()) && !"SUPER_ADMIN".equals(creatorRole)) {
                throw new RuntimeException("Only Super Admin can create another Super Admin");
            }
            
            // Hash password before saving
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            
            User savedUser = userRepository.save(user);
            if ("DRIVER".equals(savedUser.getRole())) {
                Driver driver = new Driver();
                driver.setUserId(savedUser.getId());
                driver.setName(savedUser.getName());
                driver.setPhone(savedUser.getPhone());
                driver.setAddress(savedUser.getAddress());
                driver.setJoinedDate(savedUser.getJoinDate());
                driver.setStatus("Available");
                driverRepository.save(driver);
            }
            return savedUser;
        }
        throw new RuntimeException("Unauthorized to create user");
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(Long id, User userDetails, String requesterRole) {
        if (!"SUPER_ADMIN".equals(requesterRole) && !"MANAGER".equals(requesterRole) && !"CUSTOMER".equals(requesterRole) && !"DRIVER".equals(requesterRole) && !"DISPATCHER".equals(requesterRole)) {
            throw new RuntimeException("Unauthorized to update user");
        }
        
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("MANAGER".equals(requesterRole) && "SUPER_ADMIN".equals(existingUser.getRole())) {
            throw new RuntimeException("Manager cannot edit Super Admin");
        }

        if ("MANAGER".equals(requesterRole) && "SUPER_ADMIN".equals(userDetails.getRole())) {
             throw new RuntimeException("Manager cannot change role to Super Admin");
        }

        existingUser.setName(userDetails.getName());
        existingUser.setEmail(userDetails.getEmail());
        existingUser.setPhone(userDetails.getPhone());
        if(userDetails.getJoinDate() != null) {
            existingUser.setJoinDate(userDetails.getJoinDate());
        }
        existingUser.setAddress(userDetails.getAddress());
        existingUser.setCompanyName(userDetails.getCompanyName());
        existingUser.setGstNumber(userDetails.getGstNumber());
        
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            // Only hash if it's not already hashed (in case frontend sends back the hashed string somehow, though rare)
            if (!userDetails.getPassword().startsWith("$2a$")) {
                existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            } else {
                existingUser.setPassword(userDetails.getPassword());
            }
        }
        
        if (userDetails.getAllowedPaths() != null) {
            existingUser.setAllowedPaths(userDetails.getAllowedPaths());
        }
        
        existingUser.setRole(userDetails.getRole());

        User savedUser = userRepository.save(existingUser);

        if ("DRIVER".equals(savedUser.getRole())) {
            driverRepository.findByUserId(savedUser.getId()).ifPresent(driver -> {
                driver.setName(savedUser.getName());
                driver.setPhone(savedUser.getPhone());
                driver.setAddress(savedUser.getAddress());
                driver.setJoinedDate(savedUser.getJoinDate());
                driverRepository.save(driver);
            });
        }

        return savedUser;
    }

    public void deleteUser(Long id, String requesterRole) {
        if (!"SUPER_ADMIN".equals(requesterRole) && !"MANAGER".equals(requesterRole)) {
            throw new RuntimeException("Unauthorized to delete user");
        }
        
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if ("MANAGER".equals(requesterRole) && ("SUPER_ADMIN".equals(existingUser.getRole()) || "MANAGER".equals(existingUser.getRole()))) {
            throw new RuntimeException("Manager can only delete Drivers");
        }

        if ("DRIVER".equals(existingUser.getRole())) {
            driverRepository.findByUserId(id).ifPresent(driver -> driverRepository.delete(driver));
        }

        userRepository.deleteById(id);
    }
}
