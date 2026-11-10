<?php
/**
 * CampusFind – Header Include (Bootstrap 5, Font Awesome, Poppins Font)
 */
require_once __DIR__ . '/auth.php';
$user = getCurrentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CampusFind – One Platform, Every Campus</title>
    <!-- Google Fonts Poppins -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #f8fafc; color: #1e293b; }
        .navbar-custom { background-color: #0f172a; }
        .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    </style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top py-3 shadow">
    <div class="container">
        <a class="navbar-brand fw-bold d-flex items-center gap-2" href="/campusfind/">
            <i class="fa-solid fa-location-dot text-info"></i>
            <span>Campus<span class="text-info">Find</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item"><a class="nav-link" href="/campusfind/">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="/campusfind/student/lost-items.php">Lost Items</a></li>
                <li class="nav-item"><a class="nav-link" href="/campusfind/student/found-items.php">Found Items</a></li>
                <li class="nav-item"><a class="nav-link" href="/campusfind/college-register.php">Register College</a></li>
            </ul>
            <div class="d-flex align-items-center gap-2">
                <?php if ($user): ?>
                    <?php if ($user['role'] === 'super_admin'): ?>
                        <a href="/campusfind/super-admin/dashboard.php" class="btn btn-warning btn-sm fw-bold">Super Admin Panel</a>
                    <?php elseif ($user['role'] === 'college_admin'): ?>
                        <a href="/campusfind/college-admin/dashboard.php" class="btn btn-info btn-sm fw-bold">College Admin Desk</a>
                    <?php else: ?>
                        <a href="/campusfind/student/dashboard.php" class="btn btn-outline-light btn-sm">My Dashboard</a>
                    <?php endif; ?>
                    <a href="/campusfind/logout.php" class="btn btn-danger btn-sm">Logout</a>
                <?php else: ?>
                    <a href="/campusfind/login.php" class="btn btn-outline-light btn-sm">Login</a>
                    <a href="/campusfind/register.php" class="btn btn-info btn-sm text-white fw-bold">Register Student</a>
                <?php endif; ?>
            </div>
        </div>
    </div>
</nav>
