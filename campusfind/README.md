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

## 🔐 Authentication & Access

- **Student Accounts:** Students register their own accounts via `/campusfind/register.php` by selecting an approved college and setting a password, then sign in at `/campusfind/login.php`.
- **Separate Admin Portal:** Platform administration is accessible exclusively via `/campusfind/admin-login.php` using the single administrator ID and password to oversee college approvals, claims verification, item moderation, and complaints.
