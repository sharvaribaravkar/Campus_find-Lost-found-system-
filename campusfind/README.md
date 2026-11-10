# CampusFind – One Platform, Every Campus
### Multi-College Lost and Found Management System

CampusFind is a centralized, secure Lost and Found Management System connecting students, security desks, and college administrators across multiple institutions (e.g. D.Y. Patil College of Engineering, PCCOE, MIT-WPU, COEP Technological University).

---

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, Poppins Google Font, Font Awesome
- **Backend:** PHP 8+, PDO with Prepared Statements, Secure Sessions, BCrypt Password Hashing
- **Database:** MySQL 8.0+ / MariaDB 10.4+ (`campusfind_db`)
- **Environment:** XAMPP, WAMP, or Apache/MySQL on Linux/macOS/Windows

---

## 🚀 How to Run Locally with XAMPP

### Step 1: Start XAMPP
1. Open the **XAMPP Control Panel**.
2. Click **Start** for **Apache**.
3. Click **Start** for **MySQL**.

### Step 2: Import Database in phpMyAdmin
1. Open your browser and navigate to: `http://localhost/phpmyadmin/`
2. Click on **New** on the left menu and create database name: `campusfind_db`
3. Click on the **Import** tab.
4. Click **Choose File** and select `database/campusfind_db.sql`.
5. Click **Import** at the bottom.
6. All 10 tables (`colleges`, `users`, `categories`, `items`, `lost_items`, `found_items`, `claims`, `notifications`, `feedback`, `complaints`) and realistic seed data will be imported!

### Step 3: Copy Code into htdocs
Copy this entire `campusfind` directory to:
```
C:\xampp\htdocs\campusfind\
```

### Step 4: Verify Database Connection
Check `config/database.php`. Standard XAMPP defaults are:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'campusfind_db');
```

### Step 5: Launch Website
Open your browser and navigate to:
```
http://localhost/campusfind/
```

---

## 🔑 Pre-Seeded Test Accounts

All accounts use password: `Password@123` (hashed with `password_hash()`):

| Role | Name | Email | Associated College |
|---|---|---|---|
| **Super Admin** | Vikramaditya Roy | `superadmin@campusfind.in` | Global (All Colleges) |
| **College Admin** | Dr. Suresh Kulkarni | `admin.dyp@campusfind.in` | D.Y. Patil College of Engineering |
| **College Admin** | Prof. Anjali Deshmukh | `admin.pccoe@campusfind.in` | PCCOE |
| **Student** | Rahul Sharma | `rahul.sharma@dypcoe.edu.in` | D.Y. Patil (TE-COMP-42) |
| **Student** | Priya Patel | `priya.patel@dypcoe.edu.in` | D.Y. Patil (BE-IT-18) |
| **Student** | Amit Patil | `amit.patil@pccoepune.org` | PCCOE (SE-MECH-09) |

---

## 🎯 Testing Instructions for All 3 Roles

### 1. Test Super Admin Workflow:
- Login with `superadmin@campusfind.in` / `Password@123`.
- Go to the Super Admin Dashboard.
- Notice **MKSSS Cummins College of Engineering for Women** with status `PENDING`.
- Click **Approve College** to activate the campus and provision its administrator account.
- View system-wide metrics, active colleges, and complaints.

### 2. Test College Admin Workflow:
- Login with `admin.dyp@campusfind.in` / `Password@123`.
- Go to College Admin Dashboard.
- Notice that only D.Y. Patil records and enrolled students are visible (`college_id` backend isolation).
- Review pending ownership claims submitted by students.
- Click **Approve Claim** or confirm physical handover to mark items as **Returned**.

### 3. Test Student Workflow:
- Login with `rahul.sharma@dypcoe.edu.in` / `Password@123`.
- Click **Report Lost Item** to report a misplaced belonging with photo and campus location.
- Notice the **⚡ Smart Item Match Engine**: when a found item matches your description, an instant match alert banner and side-by-side comparison appears!
- Submit an ownership claim on a found item with identifying proof.
- Track status on your Student Dashboard.
