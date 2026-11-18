<?php
/**
 * CampusFind – Student Login Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!empty($email) && !empty($password)) {
        if (strtolower($email) === 'admin@campusfind.in') {
            $error = 'Administrators must sign in via the separate Admin Portal.';
        } else {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'student' AND status = 'active'");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                if ($user['college_id'] !== null) {
                    $cStmt = $pdo->prepare("SELECT status FROM colleges WHERE id = ?");
                    $cStmt->execute([$user['college_id']]);
                    $cStatus = $cStmt->fetchColumn();
                    if ($cStatus !== 'approved') {
                        $error = 'Your college registration is currently pending Administrator approval.';
                    }
                }

                if (empty($error)) {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['user_role'] = $user['role'];
                    $_SESSION['college_id'] = $user['college_id'];

                    header('Location: /campusfind/student/dashboard.php');
                    exit;
                }
            } else {
                $error = 'Invalid college email or password.';
            }
        }
    } else {
        $error = 'Please fill in both email and password.';
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="container py-5 my-4">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card rounded-4 border shadow-sm p-4">
                <div class="text-center mb-4">
                    <h3 class="fw-bold">Student Sign In</h3>
                    <p class="text-muted small">Access your campus lost &amp; found portal</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-danger py-2 small"><?= escape($error) ?></div>
                <?php endif; ?>

                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">College Email</label>
                        <input type="email" name="email" class="form-control" placeholder="student@college.edu" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-bold">Password</label>
                        <input type="password" name="password" class="form-control" placeholder="••••••••" required>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold mt-2">Sign In</button>
                </form>

                <div class="mt-4 pt-3 border-top text-center">
                    <span class="small text-muted">Don't have an account? </span>
                    <a href="/campusfind/register.php" class="small fw-bold text-decoration-none">Register as Student</a>
                    <div class="mt-2">
                        <a href="/campusfind/admin-login.php" class="small text-warning-emphasis fw-semibold text-decoration-none">
                            <i class="fa-solid fa-shield-halved me-1"></i>Administrator? Go to Admin Portal
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
