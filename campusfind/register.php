<?php
/**
 * CampusFind – Student Registration Page
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

$error = '';
$success = '';

// Fetch approved colleges
$colleges = $pdo->query("SELECT id, name, college_code FROM colleges WHERE status = 'approved'")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $college_id = (int)($_POST['college_id'] ?? 0);
    $roll_number = trim($_POST['roll_number'] ?? '');
    $department = trim($_POST['department'] ?? '');
    $academic_year = trim($_POST['academic_year'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($name) || empty($email) || empty($college_id) || empty($password)) {
        $error = 'Please fill all required fields.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } else {
        // Check if email already registered
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = 'This email is already registered.';
        } else {
            $password_hash = password_hash($password, PASSWORD_BCRYPT);
            $insert = $pdo->prepare("
                INSERT INTO users (college_id, name, email, password_hash, roll_number, department, academic_year, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'student', 'active', NOW())
            ");
            $insert->execute([$college_id, $name, $email, $password_hash, $roll_number, $department, $academic_year]);

            $success = 'Student account created successfully! You can now log in.';
        }
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="container py-5 my-4">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card rounded-4 border shadow-sm p-4">
                <div class="text-center mb-4">
                    <h3 class="fw-bold">Student Registration</h3>
                    <p class="text-muted small">Register to access your university's Lost and Found network</p>
                </div>

                <?php if ($error): ?>
                    <div class="alert alert-danger py-2 small"><?= escape($error) ?></div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="alert alert-success py-2 small"><?= escape($success) ?> <a href="/campusfind/login.php" class="fw-bold">Sign In Now</a></div>
                <?php endif; ?>

                <form method="POST">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Full Name *</label>
                        <input type="text" name="name" class="form-control" required placeholder="e.g. Tanvi Kulkarni">
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-bold">Select Your College *</label>
                        <select name="college_id" class="form-select" required>
                            <option value="">-- Choose Approved Campus --</option>
                            <?php foreach ($colleges as $c): ?>
                                <option value="<?= $c['id'] ?>"><?= escape($c['name']) ?> (<?= escape($c['college_code']) ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label small fw-bold">College Email ID *</label>
                            <input type="email" name="email" class="form-control" required placeholder="student@college.edu">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label small fw-bold">Roll Number *</label>
                            <input type="text" name="roll_number" class="form-control" required placeholder="TE-COMP-42">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label small fw-bold">Department</label>
                            <input type="text" name="department" class="form-control" placeholder="Computer Engineering">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label small fw-bold">Academic Year</label>
                            <input type="text" name="academic_year" class="form-control" placeholder="Third Year (TE)">
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label small fw-bold">Password *</label>
                            <input type="password" name="password" class="form-control" required placeholder="••••••••">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label small fw-bold">Confirm Password *</label>
                            <input type="password" name="confirm_password" class="form-control" required placeholder="••••••••">
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold mt-2">Complete Student Registration</button>
                </form>

                <div class="mt-4 pt-3 border-top text-center">
                    <span class="small text-muted">Already registered? </span>
                    <a href="/campusfind/login.php" class="small fw-bold text-decoration-none">Sign In Here</a>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
