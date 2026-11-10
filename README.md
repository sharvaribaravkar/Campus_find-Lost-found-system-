# 🎓 CampusFind – One Platform, Every Campus
### Multi-College Lost & Found Management System

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

**CampusFind** is a centralized, secure Lost and Found Management Platform connecting students, security desks, and faculty administrators across multiple universities and engineering colleges (e.g., *D.Y. Patil College of Engineering (Akurdi)*, *PCCOE*, *MIT-WPU*, and *COEP Technological University*).

---

## 📌 Problem Statement
Across college campuses, dozens of valuables—scientific calculators, laptop chargers, earbuds, student ID cards, wallets, and backpacks—are misplaced every week. Traditional solutions rely on chaotic WhatsApp batch groups or physical notice boards where notices get buried within hours and false claims are common.

**CampusFind solves this by:**
- Enforcing **college-wise data separation** via `college_id` in the database.
- Protecting student privacy by **redacting sensitive contact details and roll numbers** from public listings.
- Automating recovery with a **rule-based Smart Matching Engine**.
- Ensuring verified chain of custody where **college admins verify proof before in-person handover**.

---

## ✨ Key Features

### 🏛️ Multi-College Isolation
- Every university operates with its own isolated records, student roster, item listings, and claims pipeline.
- Backend authorization prevents students from accessing another college's private data.
- Optional **Global Inter-College Search** allows students to search participating institutions without exposing sensitive personal information.

### 👥 Three User Account Roles
1. **Super Admin:** Master platform console to review and approve/reject college registrations (e.g. MKSSS Cummins College), activate or deactivate institutions, review platform complaints, and view recovery analytics.
2. **College Admin:** College-specific dashboard to manage students, moderate lost & found reports, evaluate ownership claims, inspect proof receipts, and mark items as officially returned upon in-person handover.
3. **Student:** Personalized student portal with recovery metrics, My Lost Items, My Found Reports, Claim Tracking, In-app Notifications, and Profile management.
4. **1-Click Quick Role Switcher:** Switch between test accounts (Super Admin, DY Patil Admin, PCCOE Admin, Rahul Student) in 1 click for testing.

### ⚡ Rule-Based Smart Matching Engine
- Automatically compares lost and found reports within the same campus.
- Scoring criteria:
  - **Category Match:** +35 points
  - **Keyword Overlap (Title & Description):** +15 to +45 points
  - **Campus Vicinity:** +20 points
  - **Date Proximity (within 4 days):** +15 points
- When confidence reaches &ge; 40%, both students receive in-app notifications and a side-by-side comparison modal.

### 📋 Secure Ownership Claim Workflow
1. Student views found item & clicks **Claim Item**.
2. Student provides private distinguishing details (scratches, lock screen, sticker, serial number) and optional proof of purchase/receipt.
3. College Admin reviews proof and approves or rejects the claim.
4. Student visits security office with College ID card for verified physical handover.
5. Admin marks item as **Returned** (with celebratory confetti!).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Build Tool** | Vite 8, `gh-pages` |
| **Backend (Optional Native PHP)** | PHP 8.2+, PDO with Prepared Statements, Secure Sessions |
| **Database** | MySQL 8.0+ / MariaDB 10.4+ (`campusfind_db.sql`) |
| **Environment** | XAMPP / WAMP / Apache for PHP/MySQL; GitHub Pages for Static React Frontend |

---

## 🗄️ Database Architecture (`campusfind_db.sql`)

The database consists of **10 interconnected relational tables** with foreign keys, indexes, and timestamps:

```
colleges
  ├── users (FK: college_id)
  ├── items (FK: college_id, user_id, category_id)
  │     ├── lost_items (FK: item_id)
  │     ├── found_items (FK: item_id)
  │     └── claims (FK: item_id, claimant_user_id, college_id)
  ├── notifications (FK: user_id, college_id)
  ├── complaints (FK: user_id, college_id)
  └── feedback (FK: user_id, college_id)
```

---

## 🚀 How to Run Locally

### 1. Run the React Web App (Vite Dev Server)
```bash
# Clone the repository
git clone https://github.com/your-username/campusfind.git
cd campusfind

# Install dependencies
npm install

# Start local dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Run the PHP & MySQL Backend with XAMPP

1. **Start Apache and MySQL** in XAMPP Control Panel.
2. Open **phpMyAdmin**: [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/).
3. Create a new database named **`campusfind_db`**.
4. Go to **Import** tab &rarr; choose `campusfind/database/campusfind_db.sql` &rarr; click **Import**.
5. Copy the `campusfind` folder to your XAMPP web root:
   ```
   C:\xampp\htdocs\campusfind\
   ```
6. Open in your browser:
   ```
   http://localhost/campusfind/
   ```

---

## 🌐 Deploy to GitHub Pages (No Blank Page!)

This repository is pre-configured with `base: './'`, `.nojekyll`, and `404.html` so you won't get a blank screen on GitHub Pages.

### Option A: 1-Command Deploy (Recommended)
```bash
npm run deploy
```
*In GitHub repository &rarr; **Settings** &rarr; **Pages**, set **Branch: `gh-pages`** and folder: **`/ (root)`**.*

### Option B: Automatic GitHub Actions
1. Push code to `main`:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```
2. In GitHub repository &rarr; **Settings** &rarr; **Pages** &rarr; **Source**: select **GitHub Actions**.

### Option C: Deploy via `/docs` Folder
```bash
npm run build:docs
git add docs/
git commit -m "Build docs for GitHub Pages"
git push origin main
```
*In GitHub repository &rarr; **Settings** &rarr; **Pages**, set **Branch: `main`** and folder: **`/docs`**.*

---

## 🔑 Pre-Seeded Test Accounts

All accounts use the password: `Password@123`

| Role | Name | Email | Associated Campus |
|---|---|---|---|
| **Super Admin** | Vikramaditya Roy | `superadmin@campusfind.in` | Global Platform Oversight |
| **College Admin** | Dr. Suresh Kulkarni | `admin.dyp@campusfind.in` | D.Y. Patil College of Engineering |
| **College Admin** | Prof. Anjali Deshmukh | `admin.pccoe@campusfind.in` | PCCOE, Pune |
| **Student** | Rahul Sharma | `rahul.sharma@dypcoe.edu.in` | D.Y. Patil (TE-COMP-42) |
| **Student** | Priya Patel | `priya.patel@dypcoe.edu.in` | D.Y. Patil (BE-IT-18) |
| **Student** | Amit Patil | `amit.patil@pccoepune.org` | PCCOE (SE-MECH-09) |

---

## 📁 Repository Directory Structure

```
├── .github/workflows/deploy.yml   # Automatic GitHub Pages CI/CD
├── campusfind/                    # Native PHP 8+ & MySQL Deliverables
│   ├── config/database.php        # Secure PDO connection config
│   ├── includes/auth.php          # Session security & role verification
│   ├── includes/functions.php     # Smart matching algorithm & XSS escaping
│   ├── database/campusfind_db.sql # Full 10-table MySQL DDL + sample seeds
│   ├── index.php                  # PHP landing page
│   ├── login.php                  # Multi-role authentication
│   ├── register.php               # Student registration with college select
│   └── college-register.php       # Institution registration (status: pending)
├── docs/                          # Pre-built static site for GitHub Pages
├── public/                        # Static assets, .nojekyll, and 404.html
├── src/
│   ├── components/                # Navbar, Footer, ItemCard, Modals
│   ├── context/                   # AuthContext with safe storage fallbacks
│   ├── data/                      # Initial seed datasets
│   ├── pages/                     # Home, Lost, Found, Dashboards
│   ├── services/storage.ts        # Business logic & Smart Match algorithm
│   └── types/index.ts             # TypeScript definitions
├── package.json                   # Scripts (dev, build, build:docs, deploy)
└── vite.config.ts                 # Configured with base: './'
```

---

## 📄 License
This project is open-source under the [Apache-2.0 License](LICENSE).
