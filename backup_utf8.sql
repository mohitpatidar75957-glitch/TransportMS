-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: tms-db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `company_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `last_used_at` datetime(6) DEFAULT NULL,
  `scopes` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKsgdkngj9u2lb7u4ar5guwnpx2` (`api_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_keys`
--

LOCK TABLES `api_keys` WRITE;
/*!40000 ALTER TABLE `api_keys` DISABLE KEYS */;
INSERT INTO `api_keys` VALUES (1,_binary '',1,'2026-10-12 19:06:05.000000','tms_live_test_demo','2026-10-16 08:41:57.861792','READ_TRIPS,WRITE_ORDERS,TALLY_SYNC','Tata Motors Logistics','Default Sandbox Partner Key');
/*!40000 ALTER TABLE `api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `employee_type` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,'2026-09-30',1,'Driver','P','Ramesh',1),(2,'2026-10-01',1,'Driver','P','Ramesh',1),(3,'2026-10-01',6,'Driver','P','Ramesh ',1),(4,'2026-10-02',6,'Driver','A','Ramesh ',1),(5,'2026-10-03',6,'Driver','P','Ramesh ',1),(6,'2026-10-04',6,'Driver','P','Ramesh ',1),(7,'2026-10-05',6,'Driver','P','Ramesh ',1),(8,'2026-10-06',6,'Driver','P','Ramesh ',1),(9,'2026-10-01',7,'Driver','P','Suresh',1),(10,'2026-10-02',7,'Driver','P','Suresh',1),(11,'2026-10-03',7,'Driver','A','Suresh',1),(12,'2026-10-04',7,'Driver','P','Suresh',1),(13,'2026-10-05',7,'Driver','P','Suresh',1),(14,'2026-10-06',7,'Driver','P','Suresh',1),(15,'2026-10-01',8,'Driver','P','Mukesh',1),(16,'2026-10-02',8,'Driver','P','Mukesh',1),(17,'2026-10-03',8,'Driver','P','Mukesh',1),(18,'2026-10-04',8,'Driver','A','Mukesh',1),(19,'2026-10-05',8,'Driver','P','Mukesh',1),(20,'2026-10-06',8,'Driver','P','Mukesh',1),(21,'2026-10-01',9,'Driver','P','Dinesh',1),(22,'2026-10-02',9,'Driver','P','Dinesh',1),(23,'2026-10-03',9,'Driver','P','Dinesh',1),(24,'2026-10-04',9,'Driver','P','Dinesh',1),(25,'2026-10-05',9,'Driver','A','Dinesh',1),(26,'2026-10-06',9,'Driver','P','Dinesh',1),(27,'2026-10-01',10,'Driver','P','Kamlesh',1),(28,'2026-10-02',10,'Driver','A','Kamlesh',1),(29,'2026-10-03',10,'Driver','P','Kamlesh',1),(30,'2026-10-04',10,'Driver','P','Kamlesh',1),(31,'2026-10-05',10,'Driver','P','Kamlesh',1),(32,'2026-10-06',10,'Driver','P','Kamlesh',1),(33,'2026-10-08',1,'Driver','P','Ramesh ',1);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `action_by` varchar(255) NOT NULL,
  `description` text,
  `entity_id` varchar(255) NOT NULL,
  `entity_name` varchar(255) NOT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `timestamp` datetime(6) NOT NULL,
  `new_value` text,
  `old_value` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'POD_UPLOADED','superadmin@tms.com','POD Document uploaded for trip TRP-42274','3','TRIP',1,'2026-09-30 10:16:51.343069',NULL,NULL),(2,'EXPENSE_AUTO_CREATED','superadmin@tms.com','Auto-generated realistic expenses of total Γé╣29484.00 for trip TRP-42274','3','FINANCE',1,'2026-09-30 10:34:00.921209',NULL,NULL),(3,'CLOSED','superadmin@tms.com','Trip closed with Actual Revenue: 45000.00 and Reconciled Costs: 29484.00','3','TRIP',1,'2026-09-30 10:34:00.942063',NULL,NULL),(4,'EDITED','SUPER_ADMIN','Updated user Ramesh ','5','User',1,'2026-10-08 12:18:38.392733','ramesh@tms.com (DRIVER)','ramesh@tms.com (DRIVER)'),(5,'ADD_NOTE','ramesh@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 12:36:11.009684',NULL,NULL),(6,'ADD_NOTE','ramesh@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:14:10.060870',NULL,NULL),(7,'ADD_NOTE','superadmin@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:21:14.913314',NULL,NULL),(8,'ADD_NOTE','superadmin@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:21:25.951804',NULL,NULL),(9,'ADD_NOTE','superadmin@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:26:00.437709',NULL,NULL),(10,'ADD_NOTE','ramesh@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:27:37.516357',NULL,NULL),(11,'ADD_NOTE','ramesh@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:33:24.229836',NULL,NULL),(12,'ADD_NOTE','superadmin@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:35:05.713892',NULL,NULL),(13,'ADD_NOTE','superadmin@tms.com','New note added by driver','1','TRIP',1,'2026-10-08 13:35:15.751027',NULL,NULL),(14,'EDITED','superadmin@tms.com','Updated vehicle DL-01-CD-5678','2','Vehicle',1,'2026-10-09 12:09:57.744953','DL-01-CD-5678 (Active)','DL-01-CD-5678 (Active)'),(15,'EDITED','superadmin@tms.com','Updated vehicle DL-01-CD-5678','2','Vehicle',1,'2026-10-09 12:14:48.318873','DL-01-CD-5678 (Active)','DL-01-CD-5678 (Active)'),(16,'EDITED','superadmin@tms.com','Updated vehicle DL-01-CD-5678','2','Vehicle',1,'2026-10-09 12:27:21.985517','DL-01-CD-5678 (Active)','DL-01-CD-5678 (Active)'),(17,'EDITED','superadmin@tms.com','Updated vehicle DL-01-CD-5678','2','Vehicle',1,'2026-10-09 12:30:04.766735','DL-01-CD-5678 (Active)','DL-01-CD-5678 (Active)'),(18,'CREATED','superadmin@tms.com','Created trip TRP-86641 for client abit sahu','5','Trip',1,'2026-10-12 11:37:05.161044','TRP-86641 (Γé╣55000)',NULL),(19,'EDITED','superadmin@tms.com','Updated trip TRP-86641','5','Trip',1,'2026-10-12 12:19:56.767192','TRP-86641 (Γé╣55000, In Transit)','TRP-86641 (Γé╣55000.00, Scheduled)'),(20,'EDITED','superadmin@tms.com','Updated trip TRP-42274','3','Trip',1,'2026-10-12 12:38:53.709193','TRP-42274 (Γé╣45000, In Transit)','TRP-42274 (Γé╣45000.00, CLOSED)'),(21,'CREATED','superadmin@tms.com','Created trip TRP-65536 for client Mohit Patidar','6','Trip',1,'2026-10-14 12:15:55.783319','TRP-65536 (Γé╣45000)',NULL),(22,'POD_UPLOADED','superadmin@tms.com','POD Document uploaded for trip TRP-73249','1','TRIP',1,'2026-10-15 06:44:08.011591',NULL,NULL),(23,'AUTO_CREATED_ON_DELIVERY','superadmin@tms.com','Auto-generated draft tax invoice for Delivered trip TRP-73249 (Amount: Γé╣5448.00)','INV-2026-73249','INVOICE',1,'2026-10-15 06:44:08.152927',NULL,NULL),(24,'PAYMENT_ADDED','superadmin@tms.com','Added part-payment Γé╣2724 via CASH. New Status: Paid','INV-2026-73249','INVOICE_PAYMENT',1,'2026-10-15 07:13:49.141843','Paid','Partially Paid'),(25,'EDITED','SUPER_ADMIN','Updated user Rohit','34','User',1,'2026-10-16 07:17:06.643636','rohit@tms.com (MANAGER)','rohit@tms.com (MANAGER)'),(26,'EDITED','nitesh@tms.com','Updated vehicle TN-09-GH-3456','4','Vehicle',1,'2026-10-16 07:18:45.021605','TN-09-GH-3456 (Active)','TN-09-GH-3456 (In Maintenance)'),(27,'DELETED','superadmin@tms.com','Deleted order ORD-1791894506093','3','Order',1,'2026-10-16 09:14:45.853523',NULL,'ORD-1791894506093 - Tata Motors Vendors Ltd (PENDING)'),(28,'EDITED','superadmin@tms.com','Updated vehicle DL-01-CD-5678','2','Vehicle',1,'2026-10-16 09:27:56.592118','DL-01-CD-5678 (Active)','DL-01-CD-5678 (Active)');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company` varchar(255) DEFAULT NULL,
  `date_received` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `fleet_size` varchar(255) DEFAULT NULL,
  `message_body` text,
  `phone` varchar(255) DEFAULT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `team_size` varchar(255) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expiry_date` date DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `driver_id` bigint DEFAULT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `vendor_id` bigint DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnp0j8imsmts7gte4a4lbojj4r` (`driver_id`),
  KEY `FKdeo5j314tx6kyk6lpqrbhhjhh` (`vehicle_id`),
  KEY `FKbs6i3yl13isdbl31si9ebcqky` (`vendor_id`),
  CONSTRAINT `FKbs6i3yl13isdbl31si9ebcqky` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `FKdeo5j314tx6kyk6lpqrbhhjhh` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `FKnp0j8imsmts7gte4a4lbojj4r` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `aadhar_number` varchar(255) DEFAULT NULL,
  `address` text,
  `alt_phone` varchar(255) DEFAULT NULL,
  `blood_group` varchar(255) DEFAULT NULL,
  `joined_date` date DEFAULT NULL,
  `license_expiry` date DEFAULT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `pan_number` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `salary_amount` double DEFAULT NULL,
  `salary_type` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `assigned_vehicle_id` bigint DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKcr60ij36fuvtcb87298g6rct6` (`license_number`),
  KEY `FKqjq0nt36sfrvo1de5l1ksxgro` (`assigned_vehicle_id`),
  CONSTRAINT `FKqjq0nt36sfrvo1de5l1ksxgro` FOREIGN KEY (`assigned_vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,'1234 5678 9001','10 Highway Road, Mumbai',NULL,'O+','2026-09-03','2027-10-07','DL-14-2021001','Ramesh ','ABCDE1231F','9988776655',25000,'Monthly','Available',5,NULL,1),(2,'1234 5678 9002','45 Transport Nagar, Delhi',NULL,'O+','2026-09-02','2027-10-07','DL-14-2022002','Suresh','ABCDE1232F','9988776656',25000,'Monthly','Available',6,NULL,1),(3,'1234 5678 9003','22 Ring Road, Surat',NULL,'O+','2026-09-01','2027-10-07','DL-14-2023003','Mukesh','ABCDE1233F','9988776657',25000,'Monthly','Available',7,NULL,1),(4,'1234 5678 9004','19 Cargo Hub, Chennai',NULL,'O+','2026-08-31','2027-10-07','DL-14-2024004','Dinesh','ABCDE1234F','9988776658',25000,'Monthly','Available',8,NULL,1),(5,'1234 5678 9005','51 Truck Terminal, Jaipur',NULL,'O+','2026-08-30','2027-10-07','DL-14-2025005','Kamlesh','ABCDE1235F','9988776659',25000,'Monthly','Available',9,NULL,1);
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `trip_id` bigint DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  `flag_reason` varchar(500) DEFAULT NULL,
  `is_flagged` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5n5te603nt2t2hgs719qxhgqk` (`vehicle_id`),
  KEY `FK9twvm79qw1voae3xgtn1xq5y9` (`trip_id`),
  CONSTRAINT `FK5n5te603nt2t2hgs719qxhgqk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `FK9twvm79qw1voae3xgtn1xq5y9` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,30438.86,'Fuel','2026-09-30','Trip Fuel Expenses',1,3,1,NULL,NULL);
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_records`
--

DROP TABLE IF EXISTS `fuel_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `liters` double DEFAULT NULL,
  `rate` decimal(38,2) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `vendor_id` bigint DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  `payment_mode` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `driver_id` bigint DEFAULT NULL,
  `flag_reason` varchar(500) DEFAULT NULL,
  `is_flagged` bit(1) DEFAULT NULL,
  `odometer_reading` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKax4cw6ba28p4jxyw3xcew7exa` (`vehicle_id`),
  KEY `FKd8xw4d81rxl0cvf85vw1vshi8` (`vendor_id`),
  KEY `FKgkh58psd0tyrxy6g4lnnoy47n` (`driver_id`),
  CONSTRAINT `FKax4cw6ba28p4jxyw3xcew7exa` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`),
  CONSTRAINT `FKd8xw4d81rxl0cvf85vw1vshi8` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `FKgkh58psd0tyrxy6g4lnnoy47n` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_records`
--

LOCK TABLES `fuel_records` WRITE;
/*!40000 ALTER TABLE `fuel_records` DISABLE KEYS */;
INSERT INTO `fuel_records` VALUES (1,'2026-09-30',50,99.70,4985.00,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL),(2,'2026-10-09',20,90.50,1810.00,2,1,1,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `fuel_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gst_invoices`
--

DROP TABLE IF EXISTS `gst_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gst_invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double DEFAULT NULL,
  `client` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `gst_amount` double DEFAULT NULL,
  `gst_percent` double DEFAULT NULL,
  `invoice_number` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total` double DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `gst_category` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKboty3rg9mudsad4ykefliqm8j` (`invoice_number`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gst_invoices`
--

LOCK TABLES `gst_invoices` WRITE;
/*!40000 ALTER TABLE `gst_invoices` DISABLE KEYS */;
INSERT INTO `gst_invoices` VALUES (1,45000,'suraj verma','2026-09-30',900,2,'INV-TRP-50840','Pending',45900,'Collected',NULL),(2,45000,'ramesh seth','2026-09-30',900,2,'INV-TRP-42274','Pending',45900,'Collected',NULL),(3,45000,'Mohit Patidar','2026-10-01',900,2,'INV-TRP-97822','Pending',45900,'Collected',NULL),(4,55000,'abit sahu','2026-10-07',1100,2,'INV-TRP-86641','Pending',56100,'Collected',NULL);
/*!40000 ALTER TABLE `gst_invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_items`
--

LOCK TABLES `inventory_items` WRITE;
/*!40000 ALTER TABLE `inventory_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `trip_id` bigint DEFAULT NULL,
  `ack_date` datetime(6) DEFAULT NULL,
  `ack_number` varchar(255) DEFAULT NULL,
  `consignee_gst` varchar(255) DEFAULT NULL,
  `consignor_gst` varchar(255) DEFAULT NULL,
  `einvoice_status` varchar(255) DEFAULT NULL,
  `eway_bill_number` varchar(255) DEFAULT NULL,
  `hsn_code` varchar(255) DEFAULT NULL,
  `irn` varchar(64) DEFAULT NULL,
  `qr_code_data` text,
  `tenant_id` bigint NOT NULL,
  `due_date` date DEFAULT NULL,
  `rcm_applicable` bit(1) DEFAULT NULL,
  `tds_amount` decimal(38,2) DEFAULT NULL,
  `tds_applicable` bit(1) DEFAULT NULL,
  `tds_rate` decimal(38,2) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKl1x55mfsay7co0r3m9ynvipd5` (`invoice_number`),
  KEY `FK4u67o3yhf4v080c5rm6f5t1nt` (`trip_id`),
  CONSTRAINT `FK4u67o3yhf4v080c5rm6f5t1nt` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,45000.00,'suraj verma','2026-09-30','INV-2026-4354','Unpaid',2,'2026-10-15 07:45:57.660373','172603253382907','24AAACG5678B1Z2','23AADCR1234F1Z5','GENERATED','346477187195','996511','0c2c1cc3d7b0af23a635ac0f4bb8d03ec140d679ffb2fef9f132abc7b9c5b853','{\"SellerGstin\":\"23AADCR1234F1Z5\",\"BuyerGstin\":\"24AAACG5678B1Z2\",\"DocNo\":\"INV-2026-4354\",\"DocTyp\":\"INV\",\"DocDt\":\"2026-09-30\",\"TotInvVal\":45000.00,\"ItemCnt\":1,\"MainHsnCode\":\"996511\",\"Irn\":\"0c2c1cc3d7b0af23a635ac0f4bb8d03ec140d679ffb2fef9f132abc7b9c5b853\",\"AckNo\":172603253382907,\"AckDt\":\"15-10-2026 13:15:57\"}',1,NULL,NULL,NULL,NULL,NULL,'mohitpatidar2479@naviaxis'),(2,45000.00,'ramesh seth','2026-09-30','INV-2026-7524','Unpaid',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,'mohitpatidar2479@naviaxis'),(3,45000.00,'Mohit Patidar','2026-10-01','INV-2026-7119','Unpaid',4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,'mohitpatidar2479@naviaxis'),(4,55000.00,'abit sahu','2026-10-07','INV-2026-9021','Unpaid',5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,'mohitpatidar2479@naviaxis'),(5,45000.00,'Mohit Patidar','2026-10-01','INV-2026-7237','Unpaid',6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,_binary '\0',0.00,_binary '\0',0.00,'mohitpatidar2479@naviaxis'),(6,5448.00,'Indore Traders Ltd','2026-09-17','INV-2026-73249','Paid',1,'2026-10-15 08:40:11.101195','172604390776174','24AAACG5678B1Z2','23AADCR1234F1Z5','GENERATED','233047205463','996511','8066e659c26c7a7d75ac08d3234254dce8ed6dfefaef5deee62c27e4d668667f','{\"SellerGstin\":\"23AADCR1234F1Z5\",\"BuyerGstin\":\"24AAACG5678B1Z2\",\"DocNo\":\"INV-2026-73249\",\"DocTyp\":\"INV\",\"DocDt\":\"2026-09-17\",\"TotInvVal\":5448.00,\"ItemCnt\":1,\"MainHsnCode\":\"996511\",\"Irn\":\"8066e659c26c7a7d75ac08d3234254dce8ed6dfefaef5deee62c27e4d668667f\",\"AckNo\":172604390776174,\"AckDt\":\"15-10-2026 14:10:11\"}',1,'2026-10-02',NULL,0.00,_binary '\0',0.00,'mohitpatidar2479@naviaxis');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `emi_amount` decimal(38,2) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9ykp747hyvsq7cu4fxsweav0y` (`vehicle_id`),
  CONSTRAINT `FK9ykp747hyvsq7cu4fxsweav0y` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lr_bilty`
--

DROP TABLE IF EXISTS `lr_bilty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lr_bilty` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `advance_amount` decimal(38,2) DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `charged_weight` double DEFAULT NULL,
  `consignee` varchar(255) DEFAULT NULL,
  `consignee_address` varchar(255) DEFAULT NULL,
  `consigneegst` varchar(255) DEFAULT NULL,
  `consignor` varchar(255) DEFAULT NULL,
  `consignor_address` varchar(255) DEFAULT NULL,
  `consignorgst` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `freight_rate` decimal(38,2) DEFAULT NULL,
  `from_location` varchar(255) DEFAULT NULL,
  `lr_date` varchar(255) DEFAULT NULL,
  `lr_number` varchar(255) DEFAULT NULL,
  `material_description` varchar(255) DEFAULT NULL,
  `no_of_articles` varchar(255) DEFAULT NULL,
  `pod_status` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `to_location` varchar(255) DEFAULT NULL,
  `to_pay` decimal(38,2) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `trip_id` bigint DEFAULT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `bilty_charge` decimal(38,2) DEFAULT NULL,
  `downloaded` bit(1) NOT NULL,
  `gst_amount` decimal(38,2) DEFAULT NULL,
  `gst_percent` double DEFAULT NULL,
  `loading_charge` decimal(38,2) DEFAULT NULL,
  `weight_unit` varchar(255) DEFAULT NULL,
  `consignee_contact` varchar(255) DEFAULT NULL,
  `consignor_contact` varchar(255) DEFAULT NULL,
  `eway_bill_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKc02qswu2ehvnjjkgcba0g4dig` (`lr_number`),
  KEY `FKk64qtklxq86pdowy020pk2qoq` (`trip_id`),
  CONSTRAINT `FKk64qtklxq86pdowy020pk2qoq` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lr_bilty`
--

LOCK TABLES `lr_bilty` WRITE;
/*!40000 ALTER TABLE `lr_bilty` DISABLE KEYS */;
INSERT INTO `lr_bilty` VALUES (1,0.00,45000.00,NULL,'amit rao',NULL,'GST-24KP78021L12122','suraj verma',NULL,'GST- 239PL0902231221','2026-09-30 07:17:56.203968',NULL,'dewas naka indore','2026-09-30','LR-TRP-50840','material box',NULL,'Pending','Generated','bhopal out line pvt.lmt',49480.00,45,2,1,730.00,_binary '\0',900.00,2,2850.00,'Ton',NULL,NULL,NULL),(2,0.00,45000.00,NULL,'manpreet jaat',NULL,'GST-11KL22CP9399V23','ramesh seth',NULL,'GST-99PL88U9214R12','2026-09-30 10:00:44.980045',NULL,'dewas bypass pantanjali pvt.lmt','2026-09-30','LR-TRP-42274','oil pack',NULL,'Pending','Generated','punjab  hight count by passward surjit warehouse',52150.00,50,3,1,1250.00,_binary '\0',900.00,2,5000.00,'Ton',NULL,NULL,NULL),(3,0.00,45000.00,NULL,'amit jain',NULL,'GST-12199KKOL5521L','Mohit Patidar',NULL,'','2026-10-07 09:36:15.216538',NULL,'Indore','2026-10-01','LR-TRP-97822','sugar box',NULL,'Pending','Generated','Indore',48300.00,35,4,1,700.00,_binary '\0',900.00,2,1700.00,'Ton','90093466237','07803962479',NULL),(4,0.00,55000.00,NULL,'veer jeet',NULL,'GST-9921LP22K33219P','abit sahu',NULL,'GST-99121PT1177OP22','2026-10-12 11:37:05.203116',NULL,'Indore','2026-10-07','LR-TRP-86641','matrial box',NULL,'Pending','Generated','Sachi sekhar complex dev nagar',59740.00,35,5,1,750.00,_binary '\0',1100.00,2,2890.00,'Ton','9399721741','7803962479',NULL),(5,NULL,45000.00,NULL,'Unknown Receiver',NULL,NULL,'Mohit Patidar',NULL,NULL,'2026-10-14 12:15:55.804093',NULL,'Indore','2026-10-01','LR-TRP-65536','sugar box',NULL,'Pending','Generated','Pune',45000.00,35,6,1,NULL,_binary '\0',NULL,NULL,NULL,'Tons',NULL,NULL,NULL);
/*!40000 ALTER TABLE `lr_bilty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date` datetime(6) DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2026-10-06 07:02:20.900742',_binary '\0','Salary payment pending for Driver Suresh (Employee #2) - Γé╣32500.0','Salary Due Alert'),(2,'2026-10-06 07:02:20.917803',_binary '\0','Salary payment pending for Driver Mukesh (Employee #3) - Γé╣25000.0','Salary Due Alert'),(3,'2026-10-06 07:02:20.926336',_binary '\0','Salary payment pending for Driver Dinesh (Employee #4) - Γé╣25000.0','Salary Due Alert'),(4,'2026-10-06 07:02:20.936261',_binary '\0','Salary payment pending for Driver Kamlesh (Employee #5) - Γé╣25000.0','Salary Due Alert'),(5,'2026-10-07 13:06:54.484450',_binary '\0','Salary payment pending for Driver Ramesh  (Employee #6) - Γé╣25000','Salary Due Alert'),(6,'2026-10-07 13:06:54.504335',_binary '\0','Salary payment pending for Driver Suresh (Employee #7) - Γé╣25000','Salary Due Alert'),(7,'2026-10-07 13:06:54.514274',_binary '\0','Salary payment pending for Driver Mukesh (Employee #8) - Γé╣25000','Salary Due Alert'),(8,'2026-10-07 13:06:54.523590',_binary '\0','Salary payment pending for Driver Dinesh (Employee #9) - Γé╣25000','Salary Due Alert'),(9,'2026-10-07 13:06:54.535153',_binary '\0','Salary payment pending for Driver Kamlesh (Employee #10) - Γé╣25000','Salary Due Alert'),(10,'2026-10-07 13:08:15.451618',_binary '\0','Salary payment pending for Driver Ramesh  (Employee #6) - Γé╣25000.0','Salary Due Alert'),(11,'2026-10-07 13:08:15.469785',_binary '\0','Salary payment pending for Driver Suresh (Employee #7) - Γé╣25000.0','Salary Due Alert'),(12,'2026-10-07 13:08:15.483446',_binary '\0','Salary payment pending for Driver Mukesh (Employee #8) - Γé╣25000.0','Salary Due Alert'),(13,'2026-10-07 13:08:15.495480',_binary '\0','Salary payment pending for Driver Dinesh (Employee #9) - Γé╣25000.0','Salary Due Alert'),(14,'2026-10-07 13:08:15.508329',_binary '\0','Salary payment pending for Driver Kamlesh (Employee #10) - Γé╣25000.0','Salary Due Alert'),(15,'2026-10-07 13:08:59.928765',_binary '\0','Salary payment pending for Driver Ramesh (Employee #11) - Γé╣25000','Salary Due Alert'),(16,'2026-10-07 13:08:59.939476',_binary '\0','Salary payment pending for Driver Suresh (Employee #12) - Γé╣25000','Salary Due Alert'),(17,'2026-10-07 13:08:59.949468',_binary '\0','Salary payment pending for Driver Mukesh (Employee #13) - Γé╣25000','Salary Due Alert'),(18,'2026-10-07 13:08:59.962360',_binary '\0','Salary payment pending for Driver Dinesh (Employee #14) - Γé╣25000','Salary Due Alert'),(19,'2026-10-07 13:08:59.972933',_binary '\0','Salary payment pending for Driver Kamlesh (Employee #15) - Γé╣25000','Salary Due Alert'),(20,'2026-10-09 12:13:29.433822',_binary '\0','Fitness for DL-01-CD-5678 has EXPIRED 24 days ago!','Fitness Expiry Alert'),(21,'2026-10-09 12:23:05.643352',_binary '\0','Fitness for DL-01-CD-5678 has EXPIRED 754 days ago!','Fitness Expiry Alert'),(22,'2026-10-09 12:29:34.619336',_binary '\0','Permit for DL-01-CD-5678 has EXPIRED 1120 days ago!','Permit Expiry Alert');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cargo_details` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `expected_date` date DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `amount` varchar(255) DEFAULT NULL,
  `drop_location` varchar(255) DEFAULT NULL,
  `pickup_location` varchar(255) DEFAULT NULL,
  `weight` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnthkiu7pgmnqnu86i2jyoe2v7` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'sugar box','Mohit Patidar','2026-10-01','ORD-0001','ASSIGNED',1,'Γé╣45000','Pune','Indore','35.0 Ton'),(2,'matrial box','abit sahu','2026-10-07','ORD-0002','ASSIGNED',1,'Γé╣55000','pune','indore','35.0 Ton');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_mode` varchar(255) DEFAULT NULL,
  `payment_reference` varchar(255) NOT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `invoice_id` bigint NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4jacl30fsqtdp5mhmg5wnvn7q` (`payment_reference`),
  KEY `FKrbqec6be74wab8iifh8g3i50i` (`invoice_id`),
  CONSTRAINT `FKrbqec6be74wab8iifh8g3i50i` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (3,2724.00,'2026-09-18','Advance Received (POD/Booking)','ADV-TRP-73249',1,6,'Advance paid by customer during booking/loading'),(4,2724.00,'2026-10-15','CASH','UPI-528050',1,6,'Part payment received');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `base_salary` decimal(38,2) DEFAULT NULL,
  `deductions` decimal(38,2) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `employee_type` varchar(255) DEFAULT NULL,
  `month_year` varchar(255) DEFAULT NULL,
  `net_payable` decimal(38,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `allowances` decimal(38,2) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
INSERT INTO `payroll` VALUES (1,35000.00,0.00,1,'Driver','October/2026',35000.00,'Paid',NULL,1),(2,32500.00,0.00,2,'Driver','10/2026',32500.00,'Pending',NULL,1),(3,25000.00,0.00,3,'Driver','10/2026',25000.00,'Pending',NULL,1),(4,25000.00,0.00,4,'Driver','10/2026',25000.00,'Pending',NULL,1),(5,25000.00,0.00,5,'Driver','10/2026',25000.00,'Pending',NULL,1),(6,45000.00,0.00,15,'Manager','10/2026',48000.00,'Pending',3000.00,1),(7,45000.00,0.00,17,'Manager','10/2026',48000.00,'Pending',3000.00,1),(8,45000.00,0.00,18,'Manager','10/2026',48000.00,'Pending',3000.00,1),(9,45000.00,0.00,23,'Manager','10/2026',48000.00,'Pending',3000.00,1),(10,45000.00,0.00,24,'Manager','10/2026',48000.00,'Pending',3000.00,1),(11,25000.00,0.00,6,'Driver','10/2026',25000.00,'Pending',0.00,1),(12,25000.00,0.00,7,'Driver','10/2026',25000.00,'Pending',0.00,1),(13,25000.00,0.00,8,'Driver','10/2026',25000.00,'Pending',0.00,1),(14,25000.00,0.00,9,'Driver','10/2026',25000.00,'Pending',0.00,1),(15,25000.00,0.00,10,'Driver','10/2026',25000.00,'Pending',0.00,1),(16,25000.00,0.00,6,'Driver','10/2026',25000.00,'Pending',0.00,1),(17,25000.00,0.00,7,'Driver','10/2026',25000.00,'Pending',0.00,1),(18,25000.00,0.00,8,'Driver','10/2026',25000.00,'Pending',0.00,1),(19,25000.00,0.00,9,'Driver','10/2026',25000.00,'Pending',0.00,1),(20,25000.00,0.00,10,'Driver','10/2026',25000.00,'Pending',0.00,1),(21,45000.00,0.00,18,'Manager','10/2026',48000.00,'Pending',3000.00,1),(22,45000.00,0.00,23,'Manager','10/2026',48000.00,'Pending',3000.00,1),(23,45000.00,0.00,24,'Manager','10/2026',48000.00,'Pending',3000.00,1),(24,25000.00,0.00,11,'Driver','10/2026',25000.00,'Pending',0.00,1),(25,25000.00,0.00,12,'Driver','10/2026',25000.00,'Pending',0.00,1),(26,25000.00,0.00,13,'Driver','10/2026',25000.00,'Pending',0.00,1),(27,25000.00,0.00,14,'Driver','10/2026',25000.00,'Pending',0.00,1),(28,25000.00,0.00,15,'Driver','10/2026',25000.00,'Pending',0.00,1),(29,45000.00,0.00,32,'Manager','10/2026',48000.00,'Pending',3000.00,1),(30,45000.00,0.00,33,'Manager','10/2026',48000.00,'Pending',3000.00,1),(31,45000.00,0.00,34,'Manager','10/2026',48000.00,'Pending',3000.00,1);
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rate_cards`
--

DROP TABLE IF EXISTS `rate_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rate_cards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `standard_rate` decimal(38,2) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  `vehicle_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rate_cards`
--

LOCK TABLES `rate_cards` WRITE;
/*!40000 ALTER TABLE `rate_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `rate_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `allowed_paths` text,
  `role_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKswe0j7vp26eywml2ipmgffjs4` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `salary` decimal(38,2) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'Rakesh Sharma','9876500001','Accountant',30000.00,1),(2,'Vikas Patel','9876500002','Dispatcher',22000.00,1),(3,'Sunita Verma','9876500003','HR Executive',28000.00,1),(4,'Rakesh Sharma','9876500001','Accountant',30000.00,1),(5,'Vikas Patel','9876500002','Dispatcher',22000.00,1),(6,'Sunita Verma','9876500003','HR Executive',28000.00,1);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` varchar(255) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnm18l4pyovtvd8y3b3x0l2y64` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tms_users`
--

DROP TABLE IF EXISTS `tms_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tms_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `allowed_paths` text,
  `email` varchar(255) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `gst_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tms_users`
--

LOCK TABLES `tms_users` WRITE;
/*!40000 ALTER TABLE `tms_users` DISABLE KEYS */;
INSERT INTO `tms_users` VALUES (1,'India, indore','*','superadmin@tms.com','2026-10-01','Super Admin','$2a$10$DP/wDvmBVtdqUAvGe53N8ut7cyhanuAKqYJDlIUBu63KPxNHkRs3a','7803962479','SUPER_ADMIN',1,'RK trader','GST-200LP991210'),(5,'10 Highway Road, Mumbai','/trips,/tracking,/whatsapp,/attendance,/payroll,/profile','ramesh@tms.com','2026-09-03','Ramesh ','$2a$10$Dz1eN23Flv.ZN1hVWS0VK.tLE9k3ZVbJvpVzlk8PSIacXbehGvut.','9988776655','DRIVER',1,NULL,NULL),(6,'45 Transport Nagar, Delhi',NULL,'suresh@tms.com','2026-09-02','Suresh','$2a$10$18Q1bIYkedl1UNabBZt8AedvRI1HFymMtWJhKnUBTw/UbuOxENmFu','9988776656','DRIVER',1,NULL,NULL),(7,'22 Ring Road, Surat',NULL,'mukesh@tms.com','2026-09-01','Mukesh','$2a$10$p1qXU5zuaHFnwEUyRk1oye7qfX18Zh5aUK.jy4QYUI14JgqzdX4x6','9988776657','DRIVER',1,NULL,NULL),(8,'19 Cargo Hub, Chennai',NULL,'dinesh@tms.com','2026-08-31','Dinesh','$2a$10$4Rl0dDpHgbxQDvNwWWK7HuV1ydZUzHArjkXwJGDtv.00ace4vmlHS','9988776658','DRIVER',1,NULL,NULL),(9,'51 Truck Terminal, Jaipur',NULL,'kamlesh@tms.com','2026-08-30','Kamlesh','$2a$10$tJYdoCuRzNOdD1AIxhIHgeGuRFJWCv5Q4V4r9JhpTKd9myELzZcgC','9988776659','DRIVER',1,NULL,NULL),(13,'Indore',NULL,'mohitpatidar75957@gmail.com','2026-10-01','Mohit Patidar','$2a$10$sJQLd4o39LNEQoINVXNTduLEvQkBhlgqZqeXy9PLTEsEjyAbUf15.','07803962479','CUSTOMER',1,NULL,NULL),(31,'Delhi, India','*','admin@tms.com','2026-10-08','Admin User','$2a$10$2js8rJOCalgv74BApIwve.p/CBVOtmztXrKSrLZYZBRYhL6tQbaPe','9876543210','SUPER_ADMIN',1,NULL,NULL),(32,'123 Operations Hub, Delhi','/,/new-trip,/vehicles,/drivers,/trips,/lr,/tracking,/whatsapp,/fuel,/vendors,/inventory,/attendance,/payroll,/staff,/documents,/reports,/contact-messages,/profile,/settings','manager@tms.com','2026-10-08','Operations Manager','$2a$10$iXIir5WoCWGxCgZYeckcZeNJDABj4vHewmKXuNWJQzhxR2XHTFxA2','+91-9876543210','MANAGER',1,NULL,NULL),(33,'24 Logistics Park, Indore','/,/new-trip,/vehicles,/drivers,/trips,/lr,/tracking,/whatsapp,/fuel,/vendors,/inventory,/attendance,/payroll,/staff,/documents,/reports,/profile','nitesh@tms.com','2026-09-28','Nitesh','$2a$10$123SNVzRxTBAJR0UUpRw1.975Lulm9aKb6wAcx1xYde5Za9SPmhTS','9876543221','MANAGER',1,NULL,NULL),(34,'Sector 5, Salt Lake, Kolkata','/,/new-trip,/vehicles,/drivers,/trips,/lr,/tracking,/whatsapp,/fuel,/vendors,/inventory,/attendance,/payroll,/staff,/documents,/reports,/profile','rohit@tms.com','2026-09-27','Rohit','$2a$10$243Yf3lcqqoIUPcHK5E9H.rG5aCF53YiqS4pvz3qL4ONqKaw7fZui','9876543223','MANAGER',1,NULL,NULL),(35,'Finance Dept','/,/payroll,/billing,/gst,/loans,/cash-bank,/reports,/profile','rakesh@tms.com','2026-09-26','Rakesh Sharma','$2a$10$3YDrzviaOyI3uTybaXpvX.oYA9YBPVvQdzmZJTqL9vguh5OTNtIQ.','9876500001','ACCOUNTANT',1,NULL,NULL),(36,'Operations Hub','/,/new-trip,/orders,/vehicles,/drivers,/trips,/lr,/tracking,/profile','vikas@tms.com','2026-09-25','Vikas Patel','$2a$10$3oReG9F7Hi9OFqXKrSpT4u5xXn.uhFhPjGaX8fx/nIAiCPl2cvOZW','9876500002','DISPATCHER',1,NULL,NULL),(37,'HR Dept','/,/attendance,/payroll,/staff,/drivers,/vehicles,/documents,/reports,/profile','sunita@tms.com','2026-09-24','Sunita Verma','$2a$10$JFoO1QD6mbdOTzOts/EZkeFbNTAC0lh1HfX4RebX7dxo9Ko5Q1Frm','9876500003','HR',1,NULL,NULL);
/*!40000 ALTER TABLE `tms_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracking_sessions`
--

DROP TABLE IF EXISTS `tracking_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracking_sessions` (
  `session_id` varchar(255) NOT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `driver_phone` varchar(255) DEFAULT NULL,
  `last_updated` datetime(6) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `speed` double DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `vehicle_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracking_sessions`
--

LOCK TABLES `tracking_sessions` WRITE;
/*!40000 ALTER TABLE `tracking_sessions` DISABLE KEYS */;
INSERT INTO `tracking_sessions` VALUES ('35cf8c63-33eb-4014-962d-f72ea1f1c727',NULL,NULL,'2026-10-12 11:37:05.132849',NULL,NULL,NULL,'2026-10-12 11:37:05.132849','ACTIVE',NULL),('b249d719-fb48-4997-b1d4-0a98853d64a9',NULL,NULL,'2026-10-14 12:15:55.757638',NULL,NULL,NULL,'2026-10-14 12:15:55.757638','ACTIVE',NULL);
/*!40000 ALTER TABLE `tracking_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `vendor_id` bigint DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbg1kqc9e0vleocepjfn0ewe8d` (`vendor_id`),
  CONSTRAINT `FKbg1kqc9e0vleocepjfn0ewe8d` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,2724.00,'2026-10-15','Part-payment received (CASH) for Invoice INV-2026-73249 Ref: UPI-528050','Credit',NULL,1);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `advance_amount` decimal(38,2) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `delivery_address` varchar(255) DEFAULT NULL,
  `dispatch_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `freight_amount` decimal(38,2) DEFAULT NULL,
  `goods_type` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `pickup_address` varchar(255) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `trip_number` varchar(255) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `driver_id` bigint DEFAULT NULL,
  `vehicle_id` bigint DEFAULT NULL,
  `vendor_id` bigint DEFAULT NULL,
  `gst_amount` decimal(38,2) DEFAULT NULL,
  `gst_percent` double DEFAULT NULL,
  `customer_contact` varchar(255) DEFAULT NULL,
  `distance` double DEFAULT NULL,
  `expected_revenue` decimal(38,2) DEFAULT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `actual_margin` decimal(38,2) DEFAULT NULL,
  `actual_revenue` decimal(38,2) DEFAULT NULL,
  `bilty_charge` decimal(38,2) DEFAULT NULL,
  `consignee_contact` varchar(255) DEFAULT NULL,
  `consignee_gst` varchar(255) DEFAULT NULL,
  `consignee_name` varchar(255) DEFAULT NULL,
  `consignor_contact` varchar(255) DEFAULT NULL,
  `consignor_gst` varchar(255) DEFAULT NULL,
  `consignor_name` varchar(255) DEFAULT NULL,
  `expected_margin` decimal(38,2) DEFAULT NULL,
  `loading_charge` decimal(38,2) DEFAULT NULL,
  `pod_status` varchar(255) DEFAULT NULL,
  `pod_url` varchar(255) DEFAULT NULL,
  `reconciled_costs` decimal(38,2) DEFAULT NULL,
  `weight_unit` varchar(255) DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `eway_bill_expiry` date DEFAULT NULL,
  `eway_bill_number` varchar(255) DEFAULT NULL,
  `freight_rate` decimal(38,2) DEFAULT NULL,
  `tracking_link` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd7duoh8wae9p906sb4mxfbryo` (`trip_number`),
  UNIQUE KEY `UKi6dvydh297pf2e2n2sotcroa4` (`tracking_link`),
  KEY `FKaq8aob3mymsvmh1fkko7k9ql9` (`driver_id`),
  KEY `FKglon758hcx1rdtl0wf1u0n743` (`vendor_id`),
  KEY `FK5c1ek6pnbbx9g32gl399vxvm5` (`order_id`),
  KEY `idx_trip_status` (`status`),
  KEY `idx_trip_tenant` (`tenant_id`),
  KEY `idx_trip_vehicle` (`vehicle_id`),
  CONSTRAINT `FK5c1ek6pnbbx9g32gl399vxvm5` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `FKaq8aob3mymsvmh1fkko7k9ql9` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `FKglon758hcx1rdtl0wf1u0n743` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`),
  CONSTRAINT `FKqahsaodjirbk4if91c9bfnlgg` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (1,2724.00,'Indore Traders Ltd','',NULL,NULL,NULL,5448.00,'','Admin: hlo lr le aan yaad se','','indore ΓåÆ bhopal','2026-09-17','Delivered','TRP-73249',NULL,1,1,NULL,NULL,NULL,NULL,186,NULL,1,5448.00,5448.00,NULL,NULL,'24AAACG5678B1Z2',NULL,NULL,'23AADCR1234F1Z5',NULL,NULL,NULL,'RECEIVED','uploads\\pod\\trip_1_pod_part_payment_slip_1792046466550.jpg',0.00,NULL,NULL,'2026-10-17','234987247823',NULL,NULL),(2,0.00,'suraj verma','bhopal out line pvt.lmt','2026-09-30',NULL,'2026-10-01',45000.00,'material box',NULL,'dewas naka indore','indore ΓåÆ bhopal','2026-09-30','CLOSED','TRP-50840',45,1,1,NULL,900.00,2,NULL,204,45000.00,1,0.00,45000.00,730.00,NULL,'27AAACR5678B1Z2','amit rao',NULL,'07AAACT1234A1Z5','suraj verma',39947.00,2850.00,'RECEIVED','uploads\\pod\\trip_2_ramesh_trip_pod_1790754540708.jpg',45000.00,'Ton',NULL,'2026-10-07','346477187195',NULL,NULL),(3,0.00,'ramesh seth','punjab  hight count by passward surjit warehouse','2026-10-01',NULL,'2026-10-04',45000.00,'oil pack',NULL,'dewas bypass pantanjali pvt.lmt','indore  ΓåÆ punjab','2026-09-30','In Transit','TRP-42274',50,1,1,NULL,900.00,2,NULL,1158,45000.00,1,15516.00,45000.00,1250.00,NULL,'GST-11KL22CP9399V23','manpreet jaat',NULL,'GST-99PL88U9214R12','ramesh seth',15516.00,5000.00,'RECEIVED','uploads\\pod\\trip_3_pod_trp_42274_1790763350009.jpg',29484.00,'Ton',NULL,NULL,NULL,NULL,NULL),(4,0.00,'Mohit Patidar','Indore','2026-10-07',NULL,'2026-10-09',45000.00,'sugar box',NULL,'Indore','pune ΓåÆ indore','2026-10-01','Scheduled','TRP-97822',35,1,3,NULL,900.00,2,NULL,605,45000.00,1,NULL,NULL,700.00,'90093466237','GST-12199KKOL5521L','amit jain','07803962479','','Mohit Patidar',27127.00,1700.00,NULL,NULL,NULL,'Ton',1,NULL,NULL,NULL,NULL),(5,0.00,'abit sahu','Sachi sekhar complex dev nagar','2026-10-12',NULL,'2026-10-13',55000.00,'matrial box',NULL,'Indore','indore ΓåÆ pune','2026-10-07','In Transit','TRP-86641',35,1,2,NULL,1100.00,2,NULL,605,55000.00,1,NULL,NULL,750.00,'9399721741','GST-9921LP22K33219P','veer jeet','7803962479','GST-99121PT1177OP22','abit sahu',35380.00,2890.00,NULL,NULL,NULL,'Ton',2,NULL,NULL,NULL,'35cf8c63-33eb-4014-962d-f72ea1f1c727'),(6,NULL,'Mohit Patidar','Pune','2026-10-01',NULL,NULL,45000.00,'sugar box',NULL,'Indore','Indore ΓåÆ Pune','2026-10-01','Scheduled','TRP-65536',35,1,5,NULL,NULL,NULL,NULL,300,45000.00,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,17857.00,NULL,NULL,NULL,NULL,'Tons',1,NULL,NULL,NULL,'b249d719-fb48-4997-b1d4-0a98853d64a9');
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_maintenance_records`
--

DROP TABLE IF EXISTS `vehicle_maintenance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_maintenance_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cost` decimal(38,2) DEFAULT NULL,
  `next_service_date` date DEFAULT NULL,
  `next_service_km` double DEFAULT NULL,
  `notes` text,
  `odometer_reading` double DEFAULT NULL,
  `service_date` date NOT NULL,
  `service_type` varchar(255) NOT NULL,
  `tenant_id` bigint NOT NULL,
  `tyre_brand` varchar(255) DEFAULT NULL,
  `tyre_position` varchar(255) DEFAULT NULL,
  `tyre_serial_number` varchar(255) DEFAULT NULL,
  `vendor_garage` varchar(255) DEFAULT NULL,
  `vehicle_id` bigint NOT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `paid_amount` decimal(38,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_mode` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `reference_number` varchar(255) DEFAULT NULL,
  `current_tread_depth_mm` double DEFAULT NULL,
  `tyre_change_due_km` double DEFAULT NULL,
  `tyre_rotation_due_km` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_vmr_vehicle` (`vehicle_id`),
  KEY `idx_vmr_type` (`service_type`),
  CONSTRAINT `FKd9csa2fv135s5nwf1hjnhgtef` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_maintenance_records`
--

LOCK TABLES `vehicle_maintenance_records` WRITE;
/*!40000 ALTER TABLE `vehicle_maintenance_records` DISABLE KEYS */;
INSERT INTO `vehicle_maintenance_records` VALUES (1,42000.00,'2026-12-18',60000,'Replaced 2 rear tyres with brand new Apollo commercial radials',48500,'2026-09-19','Tyre Replacement',1,'Apollo EnduTrax','Rear-Right-Outer','AP-8849-ZR10','Apollo Tyre Care Indore',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,18500.00,'2027-01-02',65000,'50,000 KM Periodic engine oil, air filter, and coolant overhaul',51200,'2026-10-04','Scheduled Service',1,NULL,NULL,NULL,'Tata Authorized Service Center',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,14000.00,'2027-02-11',45000,'Installed twin 12V 150Ah heavy duty battery set with 36 month warranty',32000,'2026-09-04','Battery Replacement',1,'Exide Commercial',NULL,'EX-TX-99021','Exide Power Point Bypass',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `vehicle_maintenance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `capacity` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `fitness_expiry` date DEFAULT NULL,
  `insurance_expiry` date DEFAULT NULL,
  `mileage` double DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `ownership` varchar(255) DEFAULT NULL,
  `permit_expiry` date DEFAULT NULL,
  `puc_expiry` date DEFAULT NULL,
  `registration_number` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `vendor_id` bigint DEFAULT NULL,
  `chassis_number` varchar(255) DEFAULT NULL,
  `engine_number` varchar(255) DEFAULT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `fuel_type` varchar(255) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKf6xfxoc4kprkjkst07tq63y6` (`registration_number`),
  KEY `FKtrjxmesgwfygbv6toxwh1kfxi` (`vendor_id`),
  KEY `idx_vehicle_status` (`status`),
  KEY `idx_vehicle_tenant` (`tenant_id`),
  KEY `idx_vehicle_reg` (`registration_number`),
  CONSTRAINT `FKtrjxmesgwfygbv6toxwh1kfxi` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'40','2026-09-15 09:32:02.188839','2027-09-15','2027-09-15',3.5,'2022','Tata Prima 4040','RK','2027-09-15','2027-03-15','MH-04-AB-1234','Active','Truck',NULL,'CH1987654321','EN1123456789',1,NULL,NULL),(2,'16','2026-09-15 09:32:02.209618','2027-09-15','2027-09-15',7,'2021','Ashok Leyland 3520','RK','2027-09-15','2027-03-15','DL-01-CD-5678','Active','Truck',NULL,'CH2987654321','EN2123456789',1,'Diesel',NULL),(3,'40 Tons','2026-09-15 09:32:02.225468','2027-09-15','2027-09-15',3.8,'2023','Eicher Pro 6040','RK','2027-09-15','2027-03-15','GJ-05-EF-9012','Active','Truck',NULL,'CH3987654321','EN3123456789',1,NULL,NULL),(4,'35','2026-09-15 09:32:02.238806','2027-09-15','2027-09-15',4.2,'2020','BharatBenz 3528','RK','2027-09-15','2027-03-15','TN-09-GH-3456','Active','Truck',NULL,'CH4987654321','EN4123456789',1,'Diesel',NULL),(5,'49 Tons','2026-09-15 09:32:02.253867','2027-09-15','2027-09-15',3.2,'2023','Mahindra Blazo X','RK','2027-09-15','2027-03-15','RJ-14-IJ-7890','Active','Truck',NULL,'CH5987654321','EN5123456789',1,NULL,NULL);
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendor_services`
--

DROP TABLE IF EXISTS `vendor_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_services` (
  `vendor_id` bigint NOT NULL,
  `service` varchar(255) DEFAULT NULL,
  KEY `FK190p3jid2c9omselykf5268du` (`vendor_id`),
  CONSTRAINT `FK190p3jid2c9omselykf5268du` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_services`
--

LOCK TABLES `vendor_services` WRITE;
/*!40000 ALTER TABLE `vendor_services` DISABLE KEYS */;
INSERT INTO `vendor_services` VALUES (1,'Fuel'),(2,'Fuel'),(3,'Fuel'),(4,'Fuel'),(5,'Fuel'),(6,'Fuel'),(7,'Fuel'),(8,'Fuel'),(9,'Fuel'),(10,'Fuel'),(11,'Fuel'),(12,'Fuel');
/*!40000 ALTER TABLE `vendor_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` text,
  `balance` decimal(38,2) DEFAULT NULL,
  `bank_details` text,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gstin` varchar(255) DEFAULT NULL,
  `mobile_number` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `pan` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendors`
--

LOCK TABLES `vendors` WRITE;
/*!40000 ALTER TABLE `vendors` DISABLE KEYS */;
INSERT INTO `vendors` VALUES (1,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Indian Oil Pump',NULL,'Active',1),(2,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'HP Petrol Pump',NULL,'Active',1),(3,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'BPCL Fuel Station',NULL,'Active',1),(4,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Shell Fuel Station',NULL,'Active',1),(5,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Reliance Petrol Pump',NULL,'Active',1),(6,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Nayara Energy Pump',NULL,'Active',1),(7,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Indian Oil Pump',NULL,'Active',1),(8,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'HP Petrol Pump',NULL,'Active',1),(9,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'BPCL Fuel Station',NULL,'Active',1),(10,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Shell Fuel Station',NULL,'Active',1),(11,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Reliance Petrol Pump',NULL,'Active',1),(12,NULL,0.00,NULL,NULL,NULL,NULL,NULL,'Nayara Energy Pump',NULL,'Active',1);
/*!40000 ALTER TABLE `vendors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webhooks`
--

DROP TABLE IF EXISTS `webhooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhooks` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `event_type` varchar(255) NOT NULL,
  `secret` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `tenant_id` bigint DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhooks`
--

LOCK TABLES `webhooks` WRITE;
/*!40000 ALTER TABLE `webhooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhooks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `whatsapp_logs`
--

DROP TABLE IF EXISTS `whatsapp_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient_number` varchar(255) DEFAULT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `template_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `whatsapp_logs`
--

LOCK TABLES `whatsapp_logs` WRITE;
/*!40000 ALTER TABLE `whatsapp_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `whatsapp_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `whatsapp_templates`
--

DROP TABLE IF EXISTS `whatsapp_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `whatsapp_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `content` text,
  `name` varchar(255) DEFAULT NULL,
  `trigger_event` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `whatsapp_templates`
--

LOCK TABLES `whatsapp_templates` WRITE;
/*!40000 ALTER TABLE `whatsapp_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `whatsapp_templates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-23 17:17:44
