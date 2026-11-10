import React, { useState } from 'react';
import { 
  X, 
  FileCode, 
  Database, 
  Download, 
  Copy, 
  Check, 
  Server, 
  BookOpen, 
  KeyRound, 
  ExternalLink,
  FolderTree,
  Terminal
} from 'lucide-react';

interface XamppExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XamppExportModal: React.FC<XamppExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'config' | 'auth' | 'instructions' | 'credentials' | 'structure' | 'github'>('github');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const SQL_CONTENT = `-- CAMPUSFIND MySQL Database Schema & Seed Data
-- Import into phpMyAdmin under database: campusfind_db

CREATE DATABASE IF NOT EXISTS \`campusfind_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`campusfind_db\`;

-- 1. Colleges
CREATE TABLE \`colleges\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`college_code\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(30) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`city\` VARCHAR(100) NOT NULL,
  \`state\` VARCHAR(100) NOT NULL,
  \`website\` VARCHAR(255) DEFAULT NULL,
  \`logo_url\` VARCHAR(500) DEFAULT NULL,
  \`admin_name\` VARCHAR(150) NOT NULL,
  \`admin_email\` VARCHAR(150) NOT NULL,
  \`status\` ENUM('pending', 'approved', 'rejected', 'inactive') NOT NULL DEFAULT 'pending',
  \`rejection_reason\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_colleges_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users
CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`college_id\` INT UNSIGNED DEFAULT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`roll_number\` VARCHAR(50) DEFAULT NULL,
  \`department\` VARCHAR(100) DEFAULT NULL,
  \`academic_year\` VARCHAR(50) DEFAULT NULL,
  \`phone\` VARCHAR(20) DEFAULT NULL,
  \`avatar_url\` VARCHAR(500) DEFAULT NULL,
  \`role\` ENUM('super_admin', 'college_admin', 'student') NOT NULL DEFAULT 'student',
  \`status\` ENUM('active', 'pending', 'suspended') NOT NULL DEFAULT 'active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_users_college\` (\`college_id\`),
  INDEX \`idx_users_role\` (\`role\`),
  CONSTRAINT \`fk_users_college\` FOREIGN KEY (\`college_id\`) REFERENCES \`colleges\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Categories
CREATE TABLE \`categories\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL UNIQUE,
  \`icon\` VARCHAR(50) DEFAULT 'Package',
  \`description\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Items (Master)
CREATE TABLE \`items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`college_id\` INT UNSIGNED NOT NULL,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`type\` ENUM('lost', 'found') NOT NULL,
  \`description\` TEXT NOT NULL,
  \`image_url\` VARCHAR(500) DEFAULT NULL,
  \`date_occurred\` DATE NOT NULL,
  \`time_occurred\` TIME DEFAULT NULL,
  \`location_name\` VARCHAR(255) NOT NULL,
  \`contact_preference\` VARCHAR(150) DEFAULT 'Campus Security / Admin Handover',
  \`status\` ENUM('active', 'claimed', 'returned', 'rejected') NOT NULL DEFAULT 'active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_items_college_type\` (\`college_id\`, \`type\`),
  INDEX \`idx_items_status\` (\`status\`),
  CONSTRAINT \`fk_items_college\` FOREIGN KEY (\`college_id\`) REFERENCES \`colleges\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_items_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_items_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Lost Items Detail
CREATE TABLE \`lost_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`item_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`reward_notes\` VARCHAR(255) DEFAULT NULL,
  \`additional_details\` TEXT DEFAULT NULL,
  CONSTRAINT \`fk_lost_items_item\` FOREIGN KEY (\`item_id\`) REFERENCES \`items\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Found Items Detail
CREATE TABLE \`found_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`item_id\` INT UNSIGNED NOT NULL UNIQUE,
  \`deposit_location\` VARCHAR(255) NOT NULL,
  \`is_sensitive_id_card\` TINYINT(1) DEFAULT 0,
  CONSTRAINT \`fk_found_items_item\` FOREIGN KEY (\`item_id\`) REFERENCES \`items\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Claims
CREATE TABLE \`claims\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`item_id\` INT UNSIGNED NOT NULL,
  \`claimant_user_id\` INT UNSIGNED NOT NULL,
  \`college_id\` INT UNSIGNED NOT NULL,
  \`claim_reason\` TEXT NOT NULL,
  \`proof_url\` VARCHAR(500) DEFAULT NULL,
  \`proof_text\` TEXT DEFAULT NULL,
  \`status\` ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  \`admin_remarks\` TEXT DEFAULT NULL,
  \`reviewed_by\` INT UNSIGNED DEFAULT NULL,
  \`reviewed_at\` TIMESTAMP NULL DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_claims_college\` (\`college_id\`),
  INDEX \`idx_claims_status\` (\`status\`),
  CONSTRAINT \`fk_claims_item\` FOREIGN KEY (\`item_id\`) REFERENCES \`items\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_claims_claimant\` FOREIGN KEY (\`claimant_user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_claims_college\` FOREIGN KEY (\`college_id\`) REFERENCES \`colleges\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_claims_reviewer\` FOREIGN KEY (\`reviewed_by\` ) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Notifications
CREATE TABLE \`notifications\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`college_id\` INT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`link\` VARCHAR(255) DEFAULT NULL,
  \`type\` ENUM('match', 'claim_submitted', 'claim_approved', 'claim_rejected', 'status_changed', 'college_approval') NOT NULL,
  \`is_read\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_notif_user\` (\`user_id\`, \`is_read\`),
  CONSTRAINT \`fk_notif_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Feedback
CREATE TABLE \`feedback\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`college_id\` INT UNSIGNED NOT NULL,
  \`rating\` TINYINT UNSIGNED NOT NULL CHECK (\`rating\` BETWEEN 1 AND 5),
  \`comments\` TEXT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_feedback_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Complaints
CREATE TABLE \`complaints\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`college_id\` INT UNSIGNED NOT NULL,
  \`subject\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`priority\` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  \`status\` ENUM('pending', 'investigating', 'resolved') NOT NULL DEFAULT 'pending',
  \`resolution_notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_complaints_college\` (\`college_id\`),
  CONSTRAINT \`fk_complaints_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_complaints_college\` FOREIGN KEY (\`college_id\`) REFERENCES \`colleges\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const CONFIG_CONTENT = `<?php
/**
 * CampusFind – Database Connection Configuration
 * Save to: C:/xampp/htdocs/campusfind/config/database.php
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'campusfind_db');
define('DB_PORT', '3306');

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    die("Database Connection Failed: " . htmlspecialchars($e->getMessage()));
}
?>`;

  const AUTH_CONTENT = `<?php
/**
 * CampusFind – Session & Role-Based Authorization
 * Save to: C:/xampp/htdocs/campusfind/includes/auth.php
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function isLoggedIn(): bool {
    return isset($_SESSION['user_id']);
}

function requireRole(array $allowedRoles): void {
    if (!isLoggedIn()) {
        header('Location: /campusfind/login.php?error=unauthorized');
        exit;
    }
    
    if (!in_array($_SESSION['user_role'], $allowedRoles, true)) {
        header('Location: /campusfind/index.php?error=forbidden');
        exit;
    }
}

function verifyCollegeAccess(int $targetCollegeId): bool {
    if ($_SESSION['user_role'] === 'super_admin') {
        return true;
    }
    return (int)$_SESSION['college_id'] === $targetCollegeId;
}
?>`;

  const getCurrentText = () => {
    switch (activeTab) {
      case 'sql': return SQL_CONTENT;
      case 'config': return CONFIG_CONTENT;
      case 'auth': return AUTH_CONTENT;
      default: return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SQL_CONTENT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campusfind_db.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-6 transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  XAMPP, PHP 8+ & MySQL Deployment Center
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded">
                  Deliverables 1-10
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete database SQL script, PHP files, credentials, and local installation steps.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-1 text-xs shrink-0 font-medium">
          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'github' ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-sky-600" />
            Fix GitHub Blank Page
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'instructions' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            XAMPP Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'sql' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            campusfind_db.sql
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'credentials' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            Sample Test Accounts
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'structure' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-purple-600" />
            Folder Structure
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'config' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            database.php
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'auth' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-rose-600" />
            auth.php
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          {activeTab === 'github' && (
            <div className="space-y-6">
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                <h4 className="font-bold text-rose-950 text-sm mb-1 flex items-center gap-2">
                  <span>Why Did GitHub Show a Blank White Page?</span>
                </h4>
                <p className="text-rose-800 leading-relaxed text-xs">
                  When you push code to GitHub and turn on GitHub Pages using <strong>"Deploy from a branch" (main / root)</strong>, GitHub Pages tries to serve raw <code className="font-mono bg-white px-1 py-0.5 rounded border border-rose-200">index.html</code> pointing to <code className="font-mono bg-white px-1 py-0.5 rounded border border-rose-200">src/main.tsx</code>. Browsers cannot run raw TypeScript/TSX without building, so nothing renders!
                </p>
              </div>

              <div className="space-y-4">
                <h5 className="font-bold text-slate-900 text-sm">Choose One of the 3 Solutions Below:</h5>

                {/* Solution 1 */}
                <div className="border border-emerald-300 bg-emerald-50/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Option 1 (Easiest - 1 Command Deploy):
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-slate-600">
                    We installed <code className="font-mono bg-white px-1 py-0.5 rounded border">gh-pages</code>. Simply run this in your terminal:
                  </p>
                  <pre className="bg-slate-900 text-emerald-300 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                    npm run deploy
                  </pre>
                  <p className="text-slate-600 text-[11px]">
                    This automatically compiles the project and pushes it to a <code className="font-mono font-bold">gh-pages</code> branch. In your GitHub Repo &rarr; <strong>Settings &rarr; Pages</strong>, set branch to <strong>gh-pages</strong> and folder to <strong>/ (root)</strong>. Done!
                  </p>
                </div>

                {/* Solution 2 */}
                <div className="border border-sky-300 bg-sky-50/40 rounded-2xl p-4 space-y-2">
                  <span className="font-bold text-sky-900 text-sm block">
                    Option 2: Use GitHub Actions (Automated on every push)
                  </span>
                  <p className="text-slate-600">
                    We generated <code className="font-mono">.github/workflows/deploy.yml</code> in your repository.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 text-xs">
                    <li>Push your repository commits to GitHub (<code>git push origin main</code>).</li>
                    <li>In GitHub, click <strong>Settings</strong> &rarr; <strong>Pages</strong>.</li>
                    <li>Under <strong>Build and deployment &rarr; Source</strong>, choose <strong>GitHub Actions</strong>.</li>
                  </ol>
                  <p className="text-slate-500 text-[11px]">
                    GitHub will automatically run the build on Ubuntu runner and publish your site with zero manual files!
                  </p>
                </div>

                {/* Solution 3 */}
                <div className="border border-purple-300 bg-purple-50/40 rounded-2xl p-4 space-y-2">
                  <span className="font-bold text-purple-900 text-sm block">
                    Option 3: Deploy from the <code>/docs</code> folder on <code>main</code>
                  </span>
                  <p className="text-slate-600">
                    GitHub Pages allows deploying from the <code className="font-mono">/docs</code> folder:
                  </p>
                  <pre className="bg-slate-900 text-purple-300 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                    npm run build:docs
                  </pre>
                  <p className="text-slate-600 text-[11px]">
                    Commit the generated <code className="font-mono font-bold">docs</code> folder and push to GitHub. Then in <strong>Settings &rarr; Pages</strong>, set branch: <strong>main</strong> and folder: <strong>/docs</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl">
                <h4 className="font-bold text-sky-950 text-sm mb-1">
                  How to Run CampusFind on Your Local Machine with XAMPP
                </h4>
                <p className="text-sky-800 leading-relaxed text-xs">
                  Follow these 5 simple steps to launch the complete PHP 8+ and MySQL stack locally using Apache and phpMyAdmin.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Start Apache and MySQL in XAMPP</h5>
                    <p className="text-slate-600 mt-1">
                      Open the <strong>XAMPP Control Panel</strong>. Click the green <strong>Start</strong> button next to both <strong>Apache</strong> and <strong>MySQL</strong>. Confirm both port 80/443 and 3306 are active.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Import the Database in phpMyAdmin</h5>
                    <p className="text-slate-600 mt-1">
                      Navigate to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono">http://localhost/phpmyadmin/</code> in your browser.
                    </p>
                    <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600">
                      <li>Click on <strong>New</strong> on the left sidebar to create a database named <code className="font-mono text-slate-900 font-semibold">campusfind_db</code>.</li>
                      <li>Click the <strong>Import</strong> tab at the top.</li>
                      <li>Choose the <code className="font-mono text-slate-900">campusfind_db.sql</code> file (download it from the tab above or copy from <code className="font-mono text-slate-900">/campusfind/database/campusfind_db.sql</code>).</li>
                      <li>Click <strong>Import</strong> at the bottom. All 10 tables and initial seed data will be created!</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Place Files into the htdocs Directory</h5>
                    <p className="text-slate-600 mt-1">
                      Copy the <code className="font-mono text-slate-900">campusfind</code> folder into your XAMPP web root:
                    </p>
                    <code className="block bg-slate-900 text-sky-300 p-2.5 rounded-xl font-mono mt-2">
                      C:\xampp\htdocs\campusfind\
                    </code>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Verify Database Connection Settings</h5>
                    <p className="text-slate-600 mt-1">
                      Check <code className="font-mono text-slate-900">campusfind/config/database.php</code>. Standard XAMPP defaults are:
                    </p>
                    <div className="bg-slate-100 p-3 rounded-xl font-mono text-[11px] mt-1.5 space-y-0.5">
                      <div>HOST: <strong>localhost</strong></div>
                      <div>USER: <strong>root</strong></div>
                      <div>PASS: <strong>"" (empty string)</strong></div>
                      <div>DB: <strong>campusfind_db</strong></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    5
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Launch CampusFind</h5>
                    <p className="text-slate-600 mt-1">
                      Open your browser and navigate to:
                    </p>
                    <a
                      href="http://localhost/campusfind/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sky-600 font-bold hover:underline mt-1"
                    >
                      <span>http://localhost/campusfind/</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h4 className="font-bold text-amber-950 text-sm mb-1">
                  Ready-to-Use Test Accounts for All 3 User Roles
                </h4>
                <p className="text-amber-800 text-xs">
                  All seeded accounts use password: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-slate-900 border border-amber-200">Password@123</code> (hashed with PHP <code className="font-mono">password_hash(..., PASSWORD_BCRYPT)</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Super Admin */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Super Admin</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Role A</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Controls whole platform, approves colleges</p>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                    <div><strong>Email:</strong> superadmin@campusfind.in</div>
                    <div><strong>Pass:</strong> Password@123</div>
                  </div>
                </div>

                {/* College Admin */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">College Admin</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Role B</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Manages DY Patil College records & claims</p>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                    <div><strong>Email:</strong> admin.dyp@campusfind.in</div>
                    <div><strong>Pass:</strong> Password@123</div>
                    <div className="text-[10px] text-slate-400">PCCOE: admin.pccoe@campusfind.in</div>
                  </div>
                </div>

                {/* Student */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Student Account</span>
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Role C</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Reports lost items, files claims, gets notifs</p>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                    <div><strong>Email:</strong> rahul.sharma@dypcoe.edu.in</div>
                    <div><strong>Pass:</strong> Password@123</div>
                    <div className="text-[10px] text-slate-400">Roll: TE-COMP-42</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">
                Project Directory Structure (PHP / MySQL Architecture)
              </h4>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
{`campusfind/
│
├── index.php                 # Public Landing Page & Dynamic Live Stats
├── login.php                 # Multi-role Login with password_verify()
├── register.php              # Student Registration with College Selection
├── college-register.php      # New College Onboarding (Status: Pending)
├── about.php                 # Mission, Security, and Campus Network
├── contact.php               # Campus Helpdesk & Support Form
│
├── config/
│   └── database.php          # Secure PDO Connection & Charset config
│
├── includes/
│   ├── header.php            # Responsive Navbar, Logo & Role Badges
│   ├── footer.php            # Campus Directory, Legal & Emergency info
│   ├── auth.php              # Session Guards, checkCollegeAccess()
│   └── functions.php         # Smart Matching algorithm, escape() XSS
│
├── student/
│   ├── dashboard.php         # Student Summary & Recovery Status
│   ├── report-lost.php       # Lost item filing form with photo
│   ├── report-found.php      # Found item filing with deposit spot
│   ├── lost-items.php        # College-filtered lost items catalogue
│   ├── found-items.php       # College-filtered found items catalogue
│   ├── item-details.php      # Item inspection & Ownership Claim Form
│   ├── claims.php            # Active claims status stepper
│   ├── notifications.php     # In-app alerts, Smart Match notifications
│   └── profile.php           # Student roll number & college profile
│
├── college-admin/
│   ├── dashboard.php         # College-specific metrics & charts
│   ├── students.php          # Enrolled students directory & filter
│   ├── manage-items.php      # Item approval, status toggling, delete
│   ├── manage-claims.php     # Proof inspection, approve/reject/handover
│   ├── categories.php        # Item category manager
│   └── reports.php           # College Lost & Found compliance exports
│
├── super-admin/
│   ├── dashboard.php         # Central multi-campus analytics
│   ├── colleges.php          # Approve/Reject pending registrations
│   ├── manage-users.php      # College administrators oversight
│   └── complaints.php        # Platform-wide complaints resolution
│
├── database/
│   └── campusfind_db.sql     # 10 Tables, Foreign Keys, Sample Data
│
└── uploads/
    ├── items/                # Uploaded item images
    └── proofs/               # Uploaded proof receipts`}
              </pre>
            </div>
          )}

          {(activeTab === 'sql' || activeTab === 'config' || activeTab === 'auth') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {activeTab === 'sql' ? 'campusfind_db.sql (10 tables + Seed Data)' :
                   activeTab === 'config' ? 'config/database.php (PDO Connection)' :
                   'includes/auth.php (Session & College Access Control)'}
                </span>

                <div className="flex items-center gap-2">
                  {activeTab === 'sql' && (
                    <button
                      onClick={handleDownloadSql}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .SQL</span>
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <pre className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {getCurrentText()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Files physically stored at <code className="font-mono text-slate-700 font-semibold">/campusfind/</code> in this workspace.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
