package com.tms.backend;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import com.tms.backend.repository.UserRepository;
import com.tms.backend.entity.User;
import com.tms.backend.model.Trip;
import com.tms.backend.controller.FleetController;
import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@Component
public class DatabaseUpdater {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.tms.backend.repository.DriverRepository driverRepository;

    @Autowired
    private com.tms.backend.repository.VehicleRepository vehicleRepository;

    @Autowired
    private com.tms.backend.repository.TripRepository tripRepository;

    @Autowired
    private com.tms.backend.repository.PayrollRepository payrollRepository;

    @Autowired
    private com.tms.backend.repository.AttendanceRepository attendanceRepository;

    @Autowired
    private com.tms.backend.repository.NotificationRepository notificationRepository;

    @Autowired
    private com.tms.backend.repository.StaffRepository staffRepository;

    @Autowired
    private FleetController fleetController;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostConstruct
    public void updateSchema() {
        try {
            String[] tables = {"vehicles", "trips", "drivers", "invoices", "orders", "lr_bilty", "payments", "expenses", "staff", "payroll", "attendance", "fuel_records", "vendors", "inventory_items", "documents", "transactions", "loans", "audit_logs", "rate_cards", "system_settings", "contact_messages"};
            for (String table : tables) {
                try {
                    jdbcTemplate.execute("UPDATE " + table + " SET tenant_id = 1"); // Forced update on all rows to fix filtering issues
                } catch (Exception e) {
                    System.out.println("Migration failed for table " + table + ": " + e.getMessage());
                }
            }
            System.out.println("Successfully migrated existing data to tenant_id = 1");
        } catch (Exception e) {
            System.out.println("Error migrating tenant_id: " + e.getMessage());
        }
        try {
            jdbcTemplate.execute("UPDATE vehicles SET chassis_number = CONCAT('CH', id, '987654321'), engine_number = CONCAT('EN', id, '123456789') WHERE chassis_number IS NULL OR chassis_number = ''");
            jdbcTemplate.execute("UPDATE drivers SET license_number = CONCAT('DL-14-', 2020+id, '00', id), license_expiry = DATE_ADD(CURDATE(), INTERVAL 1 YEAR), aadhar_number = CONCAT('1234 5678 900', id), pan_number = CONCAT('ABCDE123', id, 'F'), blood_group = 'O+', salary_type = 'Monthly', salary_amount = 25000 WHERE license_number IS NULL OR license_number = '' OR license_expiry IS NULL");
            jdbcTemplate.execute("UPDATE drivers SET phone = CONCAT('987654320', id) WHERE phone IS NULL OR phone = ''");
            System.out.println("Successfully filled missing chassis/engine/license/phone details for mock data.");
        } catch (Exception e) {
            System.out.println("Error updating missing details: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE lr_bilty ADD COLUMN created_at DATETIME(6)");
            System.out.println("Successfully added created_at column!");
        } catch (Exception e) {
            System.out.println("Column already exists or error: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE tms_users MODIFY COLUMN tenant_id BIGINT NULL");
            System.out.println("Successfully modified tms_users.tenant_id to NULLable!");
        } catch (Exception e) {
            System.out.println("Column modify error or notice: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("UPDATE orders SET drop_location = 'Pune' WHERE (pickup_location = 'Indore' OR pickup_location IS NULL) AND (drop_location = 'Indore' OR drop_location IS NULL OR drop_location = '')");
            System.out.println("Successfully updated Order destination routes from Indore to Pune!");
        } catch (Exception e) {
            System.out.println("Notice updating order route: " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("UPDATE lr_bilty l JOIN trips t ON (l.lr_number LIKE CONCAT('%', t.trip_number, '%') OR l.lr_number LIKE CONCAT('%', t.id, '%')) SET l.trip_id = t.id WHERE l.trip_id IS NULL");
            jdbcTemplate.execute("UPDATE lr_bilty SET trip_id = 1 WHERE trip_id IS NULL");
            System.out.println("Successfully auto-linked LR records to Trips!");
        } catch (Exception e) {}

        try {
            // Clean demo typos (matrial box -> Material Box, abit sahu -> Amit Sahu, punjab -> Pune)
            jdbcTemplate.execute("UPDATE trips SET client_name = 'Amit Sahu' WHERE LOWER(client_name) LIKE '%abit sahu%'");
            jdbcTemplate.execute("UPDATE trips SET goods_type = 'Material Box' WHERE LOWER(goods_type) LIKE '%matrial box%'");
            jdbcTemplate.execute("UPDATE trips SET route = 'Indore ➔ Pune' WHERE LOWER(route) LIKE '%punjab%'");
            jdbcTemplate.execute("UPDATE trips SET delivery_address = 'Pune' WHERE LOWER(delivery_address) LIKE '%punjab%'");

            jdbcTemplate.execute("UPDATE orders SET customer_name = 'Amit Sahu' WHERE LOWER(customer_name) LIKE '%abit sahu%'");
            jdbcTemplate.execute("UPDATE orders SET cargo_details = 'Material Box' WHERE LOWER(cargo_details) LIKE '%matrial box%'");

            jdbcTemplate.execute("UPDATE lr_bilty SET consignor = 'Amit Sahu' WHERE LOWER(consignor) LIKE '%abit sahu%'");
            jdbcTemplate.execute("UPDATE lr_bilty SET material_description = 'Material Box' WHERE LOWER(material_description) LIKE '%matrial box%'");
            jdbcTemplate.execute("UPDATE lr_bilty SET to_location = 'Pune' WHERE LOWER(to_location) LIKE '%punjab%'");

            jdbcTemplate.execute("UPDATE gst_invoices SET client = 'Amit Sahu' WHERE LOWER(client) LIKE '%abit sahu%'");

            // Standardize vehicle ownership RK -> R.K. TRADERS & LOGISTICS
            jdbcTemplate.execute("UPDATE vehicles SET ownership = 'R.K. TRADERS & LOGISTICS' WHERE ownership = 'RK' OR ownership IS NULL OR ownership = ''");
            System.out.println("Successfully cleaned demo typos (Amit Sahu, Material Box, Pune) and updated vehicle ownership to R.K. TRADERS & LOGISTICS!");
        } catch (Exception e) {
            System.out.println("Notice cleaning demo typos: " + e.getMessage());
        }


        try {
            User admin = userRepository.findFirstByEmail("superadmin@tms.com").orElse(new User());
            admin.setName("Super Admin");
            admin.setEmail("superadmin@tms.com");
            admin.setPassword(passwordEncoder.encode("CoderVu"));
            admin.setRole("SUPER_ADMIN");
            if (admin.getPhone() == null || admin.getPhone().equals("9040065140")) admin.setPhone("7803962479");
            if (admin.getJoinDate() == null) admin.setJoinDate(LocalDate.now());
            if (admin.getAddress() == null || admin.getAddress().isEmpty() || admin.getAddress().contains("Bhadrak")) admin.setAddress("India, indore");
            admin.setAllowedPaths("*");
            userRepository.save(admin);
            jdbcTemplate.execute("UPDATE tms_users SET address = 'India, indore' WHERE email = 'superadmin@tms.com' AND (address IS NULL OR address LIKE '%Bhadrak%')");
            System.out.println("Upserted Super Admin (superadmin@tms.com / CoderVu)!");
        } catch (Exception e) {
            System.out.println("Error creating superadmin: " + e.getMessage());
        }

        try {
            User admin2 = userRepository.findFirstByEmail("admin@tms.com").orElse(new User());
            admin2.setName("Admin User");
            admin2.setEmail("admin@tms.com");
            admin2.setPassword(passwordEncoder.encode("admin"));
            admin2.setRole("SUPER_ADMIN");
            admin2.setPhone("9876543210");
            if (admin2.getJoinDate() == null) admin2.setJoinDate(LocalDate.now());
            admin2.setAddress("Delhi, India");
            admin2.setAllowedPaths("*");
            userRepository.save(admin2);
        } catch (Exception e) {
            System.out.println("Error creating admin2: " + e.getMessage());
        }

        try {
            User manager = userRepository.findFirstByEmail("manager@tms.com").orElse(new User());
            manager.setName("Operations Manager");
            manager.setEmail("manager@tms.com");
            manager.setPassword(passwordEncoder.encode("password"));
            manager.setRole("MANAGER");
            manager.setPhone("+91-9876543210");
            if (manager.getJoinDate() == null) manager.setJoinDate(LocalDate.now());
            manager.setAddress("123 Operations Hub, Delhi");
            manager.setAllowedPaths("/,/new-trip,/vehicles,/drivers,/trips,/lr,/tracking,/whatsapp,/fuel,/vendors,/inventory,/attendance,/payroll,/staff,/documents,/reports,/contact-messages,/profile,/settings");
            userRepository.save(manager);
            System.out.println("Upserted Manager account!");
        } catch (Exception e) {
            System.out.println("Error creating manager: " + e.getMessage());
        }

        // Managers, Staff, and Drivers
        String[][] userData = {
            {"Nitesh", "nitesh@tms.com", "MANAGER", "9876543221", "24 Logistics Park, Indore"},
            {"Rohit", "rohit@tms.com", "MANAGER", "9876543223", "Sector 5, Salt Lake, Kolkata"},
            {"Rakesh Sharma", "rakesh@tms.com", "ACCOUNTANT", "9876500001", "Finance Dept"},
            {"Vikas Patel", "vikas@tms.com", "DISPATCHER", "9876500002", "Operations Hub"},
            {"Sunita Verma", "sunita@tms.com", "HR", "9876500003", "HR Dept"},
            {"Ramesh", "ramesh@tms.com", "DRIVER", "9988776655", "10 Highway Road, Mumbai"},
            {"Suresh", "suresh@tms.com", "DRIVER", "9988776656", "45 Transport Nagar, Delhi"},
            {"Mukesh", "mukesh@tms.com", "DRIVER", "9988776657", "22 Ring Road, Surat"},
            {"Dinesh", "dinesh@tms.com", "DRIVER", "9988776658", "19 Cargo Hub, Chennai"},
            {"Kamlesh", "kamlesh@tms.com", "DRIVER", "9988776659", "51 Truck Terminal, Jaipur"}
        };

        try {
            System.out.println("Checking for plain-text passwords in database to encode them...");
            java.util.List<User> allUsers = userRepository.findAll();
            for (User u : allUsers) {
                if (u.getPassword() != null && !u.getPassword().startsWith("$2a$")) {
                    // Update to a standard password for demo, or encode existing
                    System.out.println("Updating plain-text password for user: " + u.getEmail());
                    u.setPassword(passwordEncoder.encode("CoderVu"));
                    userRepository.save(u);
                }
            }
        } catch (Exception e) {
            System.out.println("Error updating passwords: " + e.getMessage());
        }

        for (int i = 0; i < userData.length; i++) {
            try {
                String name = userData[i][0];
                String email = userData[i][1];
                String role = userData[i][2];
                String phone = userData[i][3];
                String address = userData[i][4];

                User savedUser = userRepository.findFirstByEmail(email).orElse(null);
                if (savedUser == null) {
                    User newUser = new User();
                    newUser.setName(name);
                    newUser.setEmail(email);
                    newUser.setPassword(passwordEncoder.encode("CoderVu"));
                    newUser.setRole(role);
                    newUser.setPhone(phone);
                    newUser.setJoinDate(LocalDate.now().minusDays(10 + i));
                    newUser.setAddress(address);
                    
                    if ("MANAGER".equals(role)) {
                        newUser.setAllowedPaths("/,/new-trip,/vehicles,/drivers,/trips,/lr,/tracking,/whatsapp,/fuel,/vendors,/inventory,/attendance,/payroll,/staff,/documents,/reports,/profile");
                    } else if ("HR".equals(role)) {
                        newUser.setAllowedPaths("/,/attendance,/payroll,/staff,/drivers,/vehicles,/documents,/reports,/profile");
                    } else if ("ACCOUNTANT".equals(role)) {
                        newUser.setAllowedPaths("/,/payroll,/billing,/gst,/loans,/cash-bank,/reports,/profile");
                    } else if ("DISPATCHER".equals(role)) {
                        newUser.setAllowedPaths("/,/new-trip,/orders,/vehicles,/drivers,/trips,/lr,/tracking,/profile");
                    }
                    
                    savedUser = userRepository.save(newUser);
                }

                // Driver user accounts are synced, but driver profile entries should not be forcibly re-inserted if user deleted them
            } catch (Exception e) {
                System.out.println("Error processing user/driver " + userData[i][1] + ": " + e.getMessage());
            }
        }
        
        // 5 Truck Vehicles
        String[][] vehicleData = {
            {"MH-04-AB-1234", "Tata Prima 4040", "Truck", "40 Tons", "Active", "Owned", "3.5", "2022"},
            {"DL-01-CD-5678", "Ashok Leyland 3520", "Truck", "35 Tons", "Active", "Owned", "4.0", "2021"},
            {"GJ-05-EF-9012", "Eicher Pro 6040", "Truck", "40 Tons", "Active", "Leased", "3.8", "2023"},
            {"TN-09-GH-3456", "BharatBenz 3528", "Truck", "35 Tons", "In Maintenance", "Owned", "4.2", "2020"},
            {"RJ-14-IJ-7890", "Mahindra Blazo X", "Truck", "49 Tons", "Active", "Owned", "3.2", "2023"}
        };
        
        if (vehicleRepository.count() == 0) { // Seed sample vehicles if table is empty
        for (int i = 0; i < vehicleData.length; i++) {
            try {
                String regNum = vehicleData[i][0];
                if (((List<?>)vehicleRepository.findAll()).stream().noneMatch(v -> ((com.tms.backend.model.Vehicle)v).getRegistrationNumber().equals(regNum))) {
                    com.tms.backend.model.Vehicle v = new com.tms.backend.model.Vehicle();
                    v.setRegistrationNumber(regNum);
                    v.setName(vehicleData[i][1]);
                    v.setType(vehicleData[i][2]);
                    v.setCapacity(vehicleData[i][3]);
                    v.setStatus(vehicleData[i][4]);
                    v.setOwnership(vehicleData[i][5]);
                    v.setMileage(Double.parseDouble(vehicleData[i][6]));
                    v.setModel(vehicleData[i][7]);
                    
                    LocalDate nextYear = LocalDate.now().plusYears(1);
                    v.setInsuranceExpiry(nextYear);
                    v.setPucExpiry(nextYear.minusMonths(6));
                    v.setPermitExpiry(nextYear);
                    v.setFitnessExpiry(nextYear);
                    
                    vehicleRepository.save(v);
                }
            } catch (Exception e) {
                System.out.println("Error saving vehicle " + vehicleData[i][0] + ": " + e.getMessage());
            }
        }
        }
        
        // 3 Mock Trips (which auto-generate Invoices and LRs via FleetController)
        try {
            if (tripRepository.count() == 0) { // Seed sample trips if table is empty
            boolean hasMockTrip = ((List<?>)tripRepository.findAll()).stream()
                .anyMatch(t -> "TRP-MOCK-101".equals(((Trip)t).getTripNumber()));
                
            if (!hasMockTrip) {
                List<com.tms.backend.model.Vehicle> vehicles = (List<com.tms.backend.model.Vehicle>) vehicleRepository.findAll();
                List<com.tms.backend.model.Driver> drivers = (List<com.tms.backend.model.Driver>) driverRepository.findAll();
                
                if (vehicles.size() >= 3 && drivers.size() >= 3) {
                    Trip t1 = new Trip();
                    t1.setTripNumber("TRP-MOCK-101");
                    t1.setRoute("Mumbai - Delhi");
                    t1.setStartDate(LocalDate.now().minusDays(5));
                    t1.setFreightAmount(new BigDecimal("45000"));
                    t1.setStatus("Completed");
                    t1.setVehicle(vehicles.get(0));
                    t1.setDriver(drivers.get(0));
                    t1.setClientName("Reliance Retail");
                    t1.setGoodsType("Electronics");
                    t1.setWeight(15.5);
                    t1.setWeightUnit("Tons");
                    t1.setTenantId(1L);
                    fleetController.createTrip(t1);
                    
                    Trip t2 = new Trip();
                    t2.setTripNumber("TRP-MOCK-102");
                    t2.setRoute("Delhi - Jaipur");
                    t2.setStartDate(LocalDate.now().minusDays(2));
                    t2.setFreightAmount(new BigDecimal("18000"));
                    t2.setStatus("In Transit");
                    t2.setVehicle(vehicles.get(1));
                    t2.setDriver(drivers.get(1));
                    t2.setClientName("Tata Motors");
                    t2.setGoodsType("Auto Parts");
                    t2.setWeight(8.0);
                    t2.setWeightUnit("Tons");
                    t2.setTenantId(1L);
                    fleetController.createTrip(t2);

                    Trip t3 = new Trip();
                    t3.setTripNumber("TRP-MOCK-103");
                    t3.setRoute("Kolkata - Patna");
                    t3.setStartDate(LocalDate.now().minusDays(1));
                    t3.setFreightAmount(new BigDecimal("32000"));
                    t3.setStatus("Scheduled");
                    t3.setVehicle(vehicles.get(2));
                    t3.setDriver(drivers.get(2));
                    t3.setClientName("ITC Limited");
                    t3.setGoodsType("FMCG");
                    t3.setWeight(12.0);
                    t3.setWeightUnit("Tons");
                    t3.setTenantId(1L);
                    fleetController.createTrip(t3);
                    
                    System.out.println("Upserted Mock Trips and generated LRs/Invoices!");
                }
            }
            }
        } catch (Exception e) {
            System.out.println("Error creating mock trips: " + e.getMessage());
        }

        // Auto-sync all drivers into Payroll table & Notifications if not present
        try {
            List<com.tms.backend.model.Driver> drivers = driverRepository.findAll();
            List<com.tms.backend.model.Payroll> payrolls = payrollRepository.findAll();
            String currentMonthYear = "10/2026";

            for (com.tms.backend.model.Driver d : drivers) {
                boolean exists = payrolls.stream()
                    .anyMatch(p -> "Driver".equalsIgnoreCase(p.getEmployeeType()) && d.getId().equals(p.getEmployeeId()));
                if (!exists) {
                    java.math.BigDecimal salary = d.getSalaryAmount() != null && d.getSalaryAmount() > 0 
                        ? java.math.BigDecimal.valueOf(d.getSalaryAmount()) 
                        : new java.math.BigDecimal("25000");

                    com.tms.backend.model.Payroll p = new com.tms.backend.model.Payroll();
                    p.setEmployeeId(d.getId());
                    p.setEmployeeType("Driver");
                    p.setMonthYear(currentMonthYear);
                    p.setBaseSalary(salary);
                    p.setDeductions(java.math.BigDecimal.ZERO);
                    p.setNetPayable(salary);
                    p.setStatus(d.getId() == 1 ? "Paid" : "Pending"); // Mark first driver as Paid for sample, others Pending
                    payrollRepository.save(p);

                    if (d.getId() != 1) {
                        com.tms.backend.entity.Notification notification = new com.tms.backend.entity.Notification();
                        notification.setTitle("Salary Due Alert");
                        notification.setMessage("Salary payment pending for Driver " + d.getName() + " (Employee #" + d.getId() + ") - ₹" + salary);
                        notification.setDate(java.time.LocalDateTime.now());
                        notification.setRead(false);
                        notificationRepository.save(notification);
                    }
                }
            }
            // Auto-sync Managers into Payroll table
            List<com.tms.backend.entity.User> managerUsers = userRepository.findAll().stream()
                .filter(u -> "MANAGER".equalsIgnoreCase(u.getRole()))
                .collect(java.util.stream.Collectors.toList());

            for (com.tms.backend.entity.User m : managerUsers) {
                boolean exists = payrolls.stream()
                    .anyMatch(p -> "Manager".equalsIgnoreCase(p.getEmployeeType()) && m.getId().equals(p.getEmployeeId()));
                if (!exists) {
                    java.math.BigDecimal sal = new java.math.BigDecimal("45000");
                    com.tms.backend.model.Payroll p = new com.tms.backend.model.Payroll();
                    p.setEmployeeId(m.getId());
                    p.setEmployeeType("Manager");
                    p.setMonthYear(currentMonthYear);
                    p.setBaseSalary(sal);
                    p.setAllowances(new java.math.BigDecimal("3000"));
                    p.setDeductions(java.math.BigDecimal.ZERO);
                    p.setNetPayable(new java.math.BigDecimal("48000"));
                    p.setStatus("Pending");
                    payrollRepository.save(p);
                }
            }
            System.out.println("Auto-synced all drivers and managers into Payroll & created Notifications!");
        } catch (Exception e) {
            System.out.println("Error auto-syncing driver payrolls: " + e.getMessage());
        }

        try {
            if (staffRepository.count() == 0) {
                com.tms.backend.model.Staff s1 = new com.tms.backend.model.Staff();
                s1.setName("Rakesh Sharma");
                s1.setRole("Accountant");
                s1.setPhone("9876500001");
                s1.setSalary(new BigDecimal("30000"));
                staffRepository.save(s1);

                com.tms.backend.model.Staff s2 = new com.tms.backend.model.Staff();
                s2.setName("Vikas Patel");
                s2.setRole("Dispatcher");
                s2.setPhone("9876500002");
                s2.setSalary(new BigDecimal("22000"));
                staffRepository.save(s2);

                com.tms.backend.model.Staff s3 = new com.tms.backend.model.Staff();
                s3.setName("Sunita Verma");
                s3.setRole("HR Executive");
                s3.setPhone("9876500003");
                s3.setSalary(new BigDecimal("28000"));
                staffRepository.save(s3);

                System.out.println("Seeded sample staff members!");
            }
        } catch (Exception e) {
            System.out.println("Error seeding staff: " + e.getMessage());
        }

        try {
            if (attendanceRepository.count() == 0) {
                List<com.tms.backend.model.Driver> drivers = driverRepository.findAll();
                String[] dates = {"2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05", "2026-10-06"};
                for (int i = 0; i < drivers.size(); i++) {
                    com.tms.backend.model.Driver d = drivers.get(i);
                    for (int j = 0; j < dates.length; j++) {
                        com.tms.backend.model.Attendance att = new com.tms.backend.model.Attendance();
                        att.setDate(LocalDate.parse(dates[j]));
                        att.setEmployeeType("Driver");
                        att.setEmployeeId(d.getId());
                        att.setEmployeeName(d.getName());
                        if (j == (i % 4) + 1) {
                            att.setStatus("A");
                        } else {
                            att.setStatus("P");
                        }
                        attendanceRepository.save(att);
                    }
                }
                System.out.println("Seeded sample attendance data for drivers!");
            }
        } catch (Exception e) {
            System.out.println("Error seeding attendance: " + e.getMessage());
        }

        try {
            if (jdbcTemplate.queryForObject("SELECT COUNT(*) FROM api_keys WHERE api_key = 'tms_live_test_demo'", Integer.class) == 0) {
                jdbcTemplate.execute("INSERT INTO api_keys (api_key, name, company_name, company_id, scopes, active, created_at) " +
                        "VALUES ('tms_live_test_demo', 'Default Sandbox Partner Key', 'Tata Motors Logistics', 1, 'READ_TRIPS,WRITE_ORDERS,TALLY_SYNC', 1, NOW())");
                System.out.println("Seeded default test API Key: tms_live_test_demo");
            }
        } catch (Exception e) {
            System.out.println("Error seeding api_keys: " + e.getMessage());
        }

        try {
            Integer maintCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vehicle_maintenance_records", Integer.class);
            if (maintCount == null || maintCount == 0) {
                List<com.tms.backend.model.Vehicle> vList = vehicleRepository.findAll();
                if (!vList.isEmpty()) {
                    com.tms.backend.model.Vehicle v1 = vList.get(0);
                    jdbcTemplate.update(
                        "INSERT INTO vehicle_maintenance_records (vehicle_id, service_type, service_date, odometer_reading, cost, vendor_garage, tyre_position, tyre_serial_number, tyre_brand, next_service_date, next_service_km, status, approved_by, notes, tenant_id) " +
                        "VALUES (?, 'Tyre Replacement', DATE_SUB(CURDATE(), INTERVAL 25 DAY), 48500, 42000, 'Apollo Tyre Care Indore', 'Rear-Right-Outer', 'AP-8849-ZR10', 'Apollo EnduTrax', DATE_ADD(CURDATE(), INTERVAL 65 DAY), 60000, 'Approved', 'Super Admin', 'Replaced 2 rear tyres with brand new Apollo commercial radials', 1)",
                        v1.getId()
                    );
                    jdbcTemplate.update(
                        "INSERT INTO vehicle_maintenance_records (vehicle_id, service_type, service_date, odometer_reading, cost, vendor_garage, tyre_position, tyre_serial_number, tyre_brand, next_service_date, next_service_km, status, approved_by, notes, tenant_id) " +
                        "VALUES (?, 'Scheduled Service', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 51200, 18500, 'Tata Authorized Service Center', NULL, NULL, NULL, DATE_ADD(CURDATE(), INTERVAL 80 DAY), 65000, 'Pending', NULL, '50,000 KM Periodic engine oil, air filter, and coolant overhaul', 1)",
                        v1.getId()
                    );
                    if (vList.size() > 1) {
                        com.tms.backend.model.Vehicle v2 = vList.get(1);
                        jdbcTemplate.update(
                            "INSERT INTO vehicle_maintenance_records (vehicle_id, service_type, service_date, odometer_reading, cost, vendor_garage, tyre_position, tyre_serial_number, tyre_brand, next_service_date, next_service_km, status, approved_by, notes, tenant_id) " +
                            "VALUES (?, 'Battery Replacement', DATE_SUB(CURDATE(), INTERVAL 40 DAY), 32000, 14000, 'Exide Power Point Bypass', NULL, 'EX-TX-99021', 'Exide Commercial', DATE_ADD(CURDATE(), INTERVAL 120 DAY), 45000, 'Pending', NULL, 'Installed twin 12V 150Ah heavy duty battery set with 36 month warranty', 1)",
                            v2.getId()
                        );
                    }
                    System.out.println("Seeded sample Vehicle Maintenance and Tyre tracking records!");
                }
            }
        } catch (Exception e) {
            System.out.println("Notice on maintenance seed: " + e.getMessage());
        }
    }
}
