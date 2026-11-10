<?php
/**
 * CampusFind – College Registration Page (Status: Pending)
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

$error = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $code = strtoupper(trim($_POST['code'] ?? ''));
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $state = trim($_POST['state'] ?? '');
    $website = trim($_POST['website'] ?? '');
    $admin_name = trim($_POST['admin_name'] ?? '');
    $admin_email = trim($_POST['admin_email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($name) || empty($code) || empty($email) || empty($admin_email) || empty($password)) {
        $error = 'Please fill in all mandatory fields.';
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO colleges (college_code, name, email, phone, address, city, state, website, admin_name, admin_email, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        $stmt->execute([$code, $name, $email, $phone, $address, $city, $state, $website, $admin_name, $admin_email]);
        $newCollegeId = $pdo->lastInsertId();

        // Create inactive/pending admin account
        $pwHash = password_hash($password, PASSWORD_BCRYPT);
        $userStmt = $pdo->prepare("
            INSERT INTO users (college_id, name, email, password_hash, role, status, created_at)
            VALUES (?, ?, ?, ?, 'college_admin', 'pending', NOW())
        ");
        $userStmt->execute([$newCollegeId, $admin_name, $admin_email, $pwHash]);

        // Create notification for Super Admin
        $superAdminId = $pdo->query("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1")->fetchColumn();
        if ($superAdminId) {
            createNotification($pdo, (int)$superAdminId, (int)$newCollegeId, 'New College Registration Pending', "College {$name} ({$code}) requested registration approval.", 'college_approval');
        }

        $success = true;
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="container py-5 my-4">
    <div class="row justify-content-center">
        <div class="col-md-7">
            <div class="card rounded-4 border shadow-sm p-4">
                <?php if ($success): ?>
                    <div class="text-center py-5">
                        <i class="fa-solid fa-circle-check text-success display-3 mb-3"></i>
                        <h3 class="fw-bold">Registration Submitted!</h3>
                        <p class="text-muted small">Your institution has been registered with status <span class="badge bg-warning text-dark">PENDING</span>.<br>The Super Admin will review your credentials and activate the campus desk.</p>
                        <a href="/campusfind/" class="btn btn-primary btn-sm mt-3">Return to Home</a>
                    </div>
                <?php else: ?>
                    <div class="text-center mb-4">
                        <h3 class="fw-bold">Register Your College</h3>
                        <p class="text-muted small">Connect your institution to the centralized CampusFind network</p>
                    </div>

                    <?php if ($error): ?>
                        <div class="alert alert-danger py-2 small"><?= escape($error) ?></div>
                    <?php endif; ?>

                    <form method="POST">
                        <h6 class="fw-bold text-primary mb-3">1. Institution Details</h6>
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <label class="form-label small fw-bold">Full College Name *</label>
                                <input type="text" name="name" class="form-control" required placeholder="e.g. Pune Institute of Computer Technology">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small fw-bold">Code *</label>
                                <input type="text" name="code" class="form-control" required placeholder="PICT">
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">College Email *</label>
                                <input type="email" name="email" class="form-control" required placeholder="contact@pict.edu">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Phone Number *</label>
                                <input type="text" name="phone" class="form-control" required placeholder="+91 20 2437 1101">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label small fw-bold">Campus Address *</label>
                            <input type="text" name="address" class="form-control" required placeholder="Survey No. 27, Dhankawadi">
                        </div>

                        <div class="row mb-4">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">City *</label>
                                <input type="text" name="city" class="form-control" required placeholder="Pune">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">State *</label>
                                <input type="text" name="state" class="form-control" required placeholder="Maharashtra">
                            </div>
                        </div>

                        <h6 class="fw-bold text-primary mb-3">2. Designated Administrator</h6>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Admin Full Name *</label>
                                <input type="text" name="admin_name" class="form-control" required placeholder="Prof. Rajesh Sharma">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Admin Email *</label>
                                <input type="email" name="admin_email" class="form-control" required placeholder="admin@pict.edu">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label small fw-bold">Admin Password *</label>
                            <input type="password" name="password" class="form-control" required placeholder="••••••••">
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">Submit College Application</button>
                    </form>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
