-- ====================================================================
-- CAMPUSFIND: MULTI-COLLEGE LOST AND FOUND MANAGEMENT SYSTEM
-- Target Database: MySQL 8.0+ / MariaDB 10.4+ (XAMPP / phpMyAdmin)
-- Project: CampusFind – One Platform, Every Campus
-- ====================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- CREATE DATABASE
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `campusfind_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `campusfind_db`;

-- --------------------------------------------------------
-- 1. Table structure for table `colleges`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `complaints`;
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `claims`;
DROP TABLE IF EXISTS `found_items`;
DROP TABLE IF EXISTS `lost_items`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `colleges`;

CREATE TABLE `colleges` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `college_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `logo_url` VARCHAR(500) DEFAULT NULL,
  `admin_name` VARCHAR(150) NOT NULL,
  `admin_email` VARCHAR(150) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'inactive') NOT NULL DEFAULT 'pending',
  `rejection_reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_college_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `college_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `roll_number` VARCHAR(50) DEFAULT NULL,
  `department` VARCHAR(100) DEFAULT NULL,
  `academic_year` VARCHAR(50) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `role` ENUM('super_admin', 'college_admin', 'student') NOT NULL DEFAULT 'student',
  `status` ENUM('active', 'pending', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_college` (`college_id`),
  INDEX `idx_users_role` (`role`),
  CONSTRAINT `fk_users_college` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for table `categories`
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `icon` VARCHAR(50) DEFAULT 'Package',
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table structure for table `items`
-- --------------------------------------------------------
CREATE TABLE `items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `college_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `type` ENUM('lost', 'found') NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `date_occurred` DATE NOT NULL,
  `time_occurred` TIME DEFAULT NULL,
  `location_name` VARCHAR(255) NOT NULL,
  `contact_preference` VARCHAR(150) DEFAULT 'Campus Security / Admin Handover',
  `status` ENUM('active', 'claimed', 'returned', 'rejected') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_items_college_type` (`college_id`, `type`),
  INDEX `idx_items_status` (`status`),
  CONSTRAINT `fk_items_college` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table structure for table `lost_items`
-- --------------------------------------------------------
CREATE TABLE `lost_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` INT UNSIGNED NOT NULL UNIQUE,
  `reward_notes` VARCHAR(255) DEFAULT NULL,
  `additional_details` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_lost_items_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table structure for table `found_items`
-- --------------------------------------------------------
CREATE TABLE `found_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` INT UNSIGNED NOT NULL UNIQUE,
  `deposit_location` VARCHAR(255) NOT NULL,
  `is_sensitive_id_card` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_found_items_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table structure for table `claims`
-- --------------------------------------------------------
CREATE TABLE `claims` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_id` INT UNSIGNED NOT NULL,
  `claimant_user_id` INT UNSIGNED NOT NULL,
  `college_id` INT UNSIGNED NOT NULL,
  `claim_reason` TEXT NOT NULL,
  `proof_url` VARCHAR(500) DEFAULT NULL,
  `proof_text` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  `admin_remarks` TEXT DEFAULT NULL,
  `reviewed_by` INT UNSIGNED DEFAULT NULL,
  `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_claims_college` (`college_id`),
  INDEX `idx_claims_status` (`status`),
  CONSTRAINT `fk_claims_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_claims_claimant` FOREIGN KEY (`claimant_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_claims_college` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_claims_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Table structure for table `notifications`
-- --------------------------------------------------------
CREATE TABLE `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `college_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(255) DEFAULT NULL,
  `type` ENUM('match', 'claim_submitted', 'claim_approved', 'claim_rejected', 'status_changed', 'college_approval') NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`, `is_read`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Table structure for table `feedback`
-- --------------------------------------------------------
CREATE TABLE `feedback` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `college_id` INT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comments` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Table structure for table `complaints`
-- --------------------------------------------------------
CREATE TABLE `complaints` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `college_id` INT UNSIGNED NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `status` ENUM('pending', 'investigating', 'resolved') NOT NULL DEFAULT 'pending',
  `resolution_notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_complaints_college` (`college_id`),
  CONSTRAINT `fk_complaints_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaints_college` FOREIGN KEY (`college_id`) REFERENCES `colleges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SEED DATA
-- Default password for all sample accounts is: Password@123
-- Hash generated via password_hash('Password@123', PASSWORD_BCRYPT)
-- ========================================================

-- Categories
INSERT INTO `categories` (`id`, `name`, `icon`, `description`) VALUES
(1, 'Electronics', 'Laptop', 'Laptops, Earphones, Chargers, Phones, Powerbanks'),
(2, 'Books and Notes', 'BookOpen', 'Textbooks, Notebooks, Project Files, Lab Manuals'),
(3, 'ID Cards', 'CreditCard', 'Student ID Cards, Bus Passes, Library Cards, Driving Licenses'),
(4, 'Wallets', 'Wallet', 'Wallets, Purses, Money Pouches, Cardholders'),
(5, 'Bags', 'Backpack', 'Backpacks, Laptop Sleeves, Gym Bags, Tote Bags'),
(6, 'Keys', 'Key', 'Bike Keys, Hostel Room Keys, Locker Keys, Keychains'),
(7, 'Water Bottles', 'Coffee', 'Flasks, Tupperware Bottles, Metal Shakers'),
(8, 'Watches', 'Watch', 'Smartwatches, Analog Wristwatches, Fitness Bands'),
(9, 'Accessories', 'Glasses', 'Spectacles, Sunglasses, Umbrellas, Caps, Jackets'),
(10, 'Other', 'Package', 'Calculators, Geometry Kits, Sports Equipment, Miscellaneous');

-- Colleges
INSERT INTO `colleges` (`id`, `college_code`, `name`, `email`, `phone`, `address`, `city`, `state`, `website`, `logo_url`, `admin_name`, `admin_email`, `status`) VALUES
(1, 'DYPCOE', 'D.Y. Patil College of Engineering, Akurdi', 'lostfound@dypcoeakurdi.ac.in', '+91 20 2765 3058', 'Sector 29, Nigdi Pradhikaran, Akurdi', 'Pune', 'Maharashtra', 'https://www.dypcoeakurdi.ac.in', 'https://images.unsplash.com/photo-1562774053-701939374585?w=150', 'Dr. Suresh Kulkarni', 'admin.dyp@campusfind.in', 'approved'),
(2, 'PCCOE', 'Pimpri Chinchwad College of Engineering (PCCOE)', 'lostfound@pccoepune.org', '+91 20 2765 3168', 'Near Akurdi Railway Station Road, Sector 26, Pradhikaran', 'Pune', 'Maharashtra', 'https://www.pccoepune.com', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150', 'Prof. Anjali Deshmukh', 'admin.pccoe@campusfind.in', 'approved'),
(3, 'MITWPU', 'MIT World Peace University (MIT-WPU)', 'campussecurity@mitwpu.edu.in', '+91 20 7117 7104', 'S.No.124, Paud Rd, Kothrud', 'Pune', 'Maharashtra', 'https://mitwpu.edu.in', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150', 'Col. Rajesh Verma', 'admin.mit@campusfind.in', 'approved'),
(4, 'COEP', 'COEP Technological University', 'admin@coeptech.ac.in', '+91 20 2550 7000', 'Wellesley Rd, Shivajinagar', 'Pune', 'Maharashtra', 'https://www.coeptech.ac.in', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150', 'Dr. Anand Joshi', 'admin.coep@campusfind.in', 'approved'),
(5, 'CCOEW', 'MKSSS Cummins College of Engineering for Women', 'contact@cumminscollege.in', '+91 20 2531 1000', 'Karve Nagar', 'Pune', 'Maharashtra', 'https://www.cumminscollege.org', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150', 'Prof. Sunita Shinde', 'admin.cummins@campusfind.in', 'pending');

-- Users
-- Password hash for 'Password@123': $2y$10$fWnK16p1c5oG4178xK43k.gN1K2WkQG.V7b3/O9g0qKkXqW4y.O2u
INSERT INTO `users` (`id`, `college_id`, `name`, `email`, `password_hash`, `roll_number`, `department`, `academic_year`, `phone`, `role`, `status`) VALUES
(1, NULL, 'Vikramaditya Roy (Super Admin)', 'superadmin@campusfind.in', '$2y$10$fWnK16p1c5oG4178xK43k.gN1K2WkQG.V7b3/O9g0qKkXqW4y.O2u', NULL, NULL, NULL, '+91 98220 11223', 'super_admin', 'active'),
(2, 1, 'Dr. Suresh Kulkarni', 'admin.dyp@campusfind.in', '$2y$10$fWnK16p1c5oG4178xK43k.gN1K2WkQG.V7b3/O9g0qKkXqW4y.O2u', NULL, 'Computer Engineering', NULL, '+91 94220 55441', 'college_admin', 'active'),
(3, 2, 'Prof. Anjali Deshmukh', 'admin.pccoe@campusfind.in', '$2y$10$fWnK16p1c5oG4178xK43k.gN1K2WkQG.V7b3/O9g0qKkXqW4y.O2u', NULL, 'Dean Student Affairs', NULL, '+91 98810 66772', 'college_admin', 'active'),
(4, 1, 'Rahul Sharma', 'rahul.sharma@dypcoe.edu.in', '$2y$10$fWnK16p1c5oG4178xK43k.gN1K2WkQG.V7b3/O9g0qKkXqW4y.O2u', 'TE-COMP-42', 'Computer Engineering', 'Third Year (TE)', '+91 98234 56789', 'student', 'active'),
(5, 1, 'Priya Patel', 'priya.patel@dypcoe.edu.in', '$2y$10$fWnK16p1c5oG4178xK43k.gN1K2WkQG.V7b3/O9g0qKkXqW4y.O2u', 'BE-IT-18', 'Information Technology', 'Final Year (BE)', '+91 97654 32109', 'student', 'active'),
(6, 2, 'Amit Patil', 'amit.patil@pccoepune.org', '$2y$10$fWnK16p1c5oG4178xK43k.gN1K2WkQG.V7b3/O9g0qKkXqW4y.O2u', 'SE-MECH-09', 'Mechanical Engineering', 'Second Year (SE)', '+91 98901 23456', 'student', 'active');

-- Items
INSERT INTO `items` (`id`, `college_id`, `user_id`, `category_id`, `title`, `type`, `description`, `image_url`, `date_occurred`, `time_occurred`, `location_name`, `contact_preference`, `status`) VALUES
(1, 1, 4, 1, 'Boat Airdopes 141 (Black Case with Batman sticker)', 'lost', 'Black charging case containing wireless earbuds with yellow/black Batman sticker. Lost around reading hall.', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', '2026-10-29', '14:30:00', 'Central Library, 2nd Floor Reading Room', 'In-app Chat & Verified Admin Handover', 'active'),
(2, 1, 5, 1, 'Black TWS Earbuds in matte case with sticker', 'found', 'Found a black wireless earbud case on Table #14 in the library. Has a superhero emblem sticker.', 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600', '2026-10-29', '16:00:00', 'Central Library, 2nd Floor Reading Room', 'Collect from Security / Admin', 'active'),
(3, 1, 4, 10, 'Casio Scientific Calculator FX-991CW', 'lost', 'Casio ClassWiz scientific calculator in black slip cover. Has initials RS in silver marker.', 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600', '2026-10-28', '11:15:00', 'Computer Dept Lab 402, 4th Floor', 'Call or WhatsApp', 'active'),
(4, 1, 2, 4, 'Brown Leather Fossil Bi-Fold Wallet', 'found', 'Brown leather wallet with cash and cards found near the Campus Canteen lawn.', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', '2026-10-30', '13:00:00', 'Main Canteen Green Lawn', 'Dean Student Affairs Office', 'active'),
(5, 2, 6, 5, 'Wildcraft Grey Laptop Backpack with Blue Accents', 'lost', 'Grey and navy 32L backpack. Contains Data Structures spiral notebook and engineering drawing instruments.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', '2026-10-30', '17:15:00', 'Mechanical Workshop Building Porch', 'Phone Call', 'active');

-- Lost specifics
INSERT INTO `lost_items` (`id`, `item_id`, `reward_notes`, `additional_details`) VALUES
(1, 1, 'Chocolates & Gratitude', 'Serial number ends in 8943. Left earbud has slight scratch.'),
(2, 3, NULL, 'Urgent: needed for practical exam.'),
(3, 5, 'Reward Rs 500', 'Drafter has Amit P. written with marker.');

-- Found specifics
INSERT INTO `found_items` (`id`, `item_id`, `deposit_location`, `is_sensitive_id_card`) VALUES
(1, 2, 'Central Library Reception Desk with Librarian Mr. Shinde', 0),
(2, 4, 'Main Security Office (Gate #1) with Head Guard Mr. Yadav', 0);

-- Claims
INSERT INTO `claims` (`id`, `item_id`, `claimant_user_id`, `college_id`, `claim_reason`, `proof_text`, `status`, `admin_remarks`) VALUES
(1, 2, 4, 1, 'This is my Boat Airdopes 141 lost on Oct 29. The case has my Batman sticker and serial ends in 8943.', 'Amazon Order # 402-9843211-192837. Box serial number matches 8943.', 'pending', 'Under review by Dr. Kulkarni.');

-- Notifications
INSERT INTO `notifications` (`id`, `user_id`, `college_id`, `title`, `message`, `type`, `is_read`) VALUES
(1, 4, 1, '⚡ Smart Match Detected!', 'A found item "Black TWS Earbuds with sticker" matches your lost report "Boat Airdopes 141".', 'match', 0),
(2, 2, 1, 'New Ownership Claim Submitted', 'Rahul Sharma (TE-COMP-42) submitted a claim for "Black TWS Earbuds in matte case".', 'claim_submitted', 0),
(3, 1, 5, 'New College Registration Pending', 'MKSSS Cummins College of Engineering for Women submitted registration request.', 'college_approval', 0);

COMMIT;
