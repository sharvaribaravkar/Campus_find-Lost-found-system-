<?php
/**
 * CampusFind – Separate Admin Portal Login (Single Admin ID & Password)
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

define('ADMIN_PORTAL_ID', 'admin@campusfind.in');
define('ADMIN_PORTAL_PASS', 'CampusFind@2026');

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $adminId = trim($_POST['admin_id'] ?? '');
    $password = $_POST['password'] ?? '';

    if (strtolower($adminId) === ADMIN_PORTAL_ID && $password === ADMIN_PORTAL_PASS) {
        $_SESSION['user_id'] = 1;
        $_SESSION['user_name'] = 'CampusFind Administrator';
        $_SESSION['user_email'] = ADMIN_PORTAL_ID;
        $_SESSION['user_role'] = 'super_admin';
        $_SESSION['college_id'] = null;

        header('Location: /campusfind/super-admin/dashboard.php');
        exit;
    } else {
        $error = 'Invalid Admin ID or Password. Access denied.';
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="container py-5 my-4">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card rounded-4 border-0 shadow-lg overflow-hidden">
                <div class="bg-dark text-white p-4 text-center">
                    <div class="mb-2">
                        <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                            <i class="fa-solid fa-shield-halved me-1"></i> Restricted Access
                        </span>
                    </div>
                    <h4 class="fw-bold mb-1">CampusFind Admin Portal</h4>
                    <p class="small text-white-50 mb-0">Single Administrator Credentials Required</p>
                </div>

                <div class="card-body p-4 bg-white">
                    <?php if ($error): ?>
                        <div class="alert alert-danger py-2 small"><?= escape($error) ?></div>
                    <?php endif; ?>

                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label small fw-bold">Administrator ID</label>
                            <input type="text" name="admin_id" class="form-control" placeholder="Enter Admin ID" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label small fw-bold">Password</label>
                            <input type="password" name="password" class="form-control" placeholder="Enter Admin Password" required>
                        </div>

                        <button type="submit" class="btn btn-dark w-100 py-2 fw-bold mt-2">
                            Access Admin Portal
                        </button>
                    </form>

                    <div class="mt-4 pt-3 border-top text-center">
                        <a href="/campusfind/login.php" class="small text-muted text-decoration-none">
                            &larr; Student Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
