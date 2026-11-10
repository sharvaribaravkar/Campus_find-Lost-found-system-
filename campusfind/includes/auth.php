<?php
/**
 * CampusFind – Authentication & Session Security Helper
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function isLoggedIn(): bool {
    return isset($_SESSION['user_id']);
}

function getCurrentUser(): ?array {
    if (!isLoggedIn()) return null;
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email'],
        'role' => $_SESSION['user_role'],
        'college_id' => $_SESSION['college_id'] ?? null,
    ];
}

function requireLogin(array $allowedRoles = []): void {
    if (!isLoggedIn()) {
        header('Location: /campusfind/login.php?error=unauthorized');
        exit;
    }
    
    if (!empty($allowedRoles) && !in_array($_SESSION['user_role'], $allowedRoles, true)) {
        header('Location: /campusfind/index.php?error=forbidden');
        exit;
    }
}

function checkCollegeAccess(int $targetCollegeId): bool {
    // Super admin can access all colleges
    if ($_SESSION['user_role'] === 'super_admin') {
        return true;
    }
    // College admins & students can only access their registered college
    return (int)$_SESSION['college_id'] === $targetCollegeId;
}
?>
