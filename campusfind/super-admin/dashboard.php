<?php
/**
 * CampusFind – Super Admin Dashboard
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin(['super_admin']);
$user = getCurrentUser();

// Handle approval/rejection POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'], $_POST['college_id'])) {
    $cId = (int)$_POST['college_id'];
    $act = $_POST['action'];

    if ($act === 'approve') {
        $pdo->prepare("UPDATE colleges SET status = 'approved' WHERE id = ?")->execute([$cId]);
        $pdo->prepare("UPDATE users SET status = 'active' WHERE college_id = ? AND role = 'college_admin'")->execute([$cId]);
    } elseif ($act === 'reject') {
        $pdo->prepare("UPDATE colleges SET status = 'rejected' WHERE id = ?")->execute([$cId]);
    }
    header('Location: /campusfind/super-admin/dashboard.php');
    exit;
}

// Fetch all colleges
$colleges = $pdo->query("SELECT * FROM colleges ORDER BY created_at DESC")->fetchAll();
$pendingColleges = array_filter($colleges, fn($c) => $c['status'] === 'pending');

// Stats
$totalColleges = count(array_filter($colleges, fn($c) => $c['status'] === 'approved'));
$totalStudents = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
$totalLost = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE type = 'lost'")->fetchColumn();
$totalFound = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE type = 'found'")->fetchColumn();
$totalReturned = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE status = 'returned'")->fetchColumn();

include __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
    <div class="card rounded-4 border-0 shadow-sm p-4 mb-4 text-white" style="background: linear-gradient(135deg, #78350f 0%, #0f172a 100%);">
        <span class="badge bg-warning text-dark text-uppercase mb-1" style="width: fit-content;">Super Admin Central Console</span>
        <h3 class="fw-bold mb-1">Central University Network Oversight</h3>
        <small class="text-white-50">Master Control • Manage all participating campuses, approvals, and administrators</small>
    </div>

    <!-- Platform Stats -->
    <div class="row g-3 mb-4 text-center">
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-primary mb-0"><?= $totalColleges ?></h3>
                <small class="text-muted fw-semibold">Active Campuses</small>
            </div>
        </div>
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-warning mb-0"><?= count($pendingColleges) ?></h3>
                <small class="text-muted fw-semibold">Pending Approvals</small>
            </div>
        </div>
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-info mb-0"><?= $totalStudents ?></h3>
                <small class="text-muted fw-semibold">Total Students</small>
            </div>
        </div>
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-danger mb-0"><?= $totalLost ?></h3>
                <small class="text-muted fw-semibold">Lost Items</small>
            </div>
        </div>
        <div class="col-12 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-success mb-0"><?= $totalReturned ?></h3>
                <small class="text-muted fw-semibold">Total Recoveries</small>
            </div>
        </div>
    </div>

    <!-- Pending Approvals -->
    <div class="card border rounded-4 shadow-sm p-4 bg-white mb-4">
        <h5 class="fw-bold text-warning mb-3"><i class="fa-solid fa-clock"></i> Pending College Approvals (<?= count($pendingColleges) ?>)</h5>
        <?php if (empty($pendingColleges)): ?>
            <p class="text-muted small py-3 text-center mb-0">No pending college registrations.</p>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-hover align-middle small">
                    <thead class="table-light">
                        <tr>
                            <th>College Name</th>
                            <th>Code</th>
                            <th>Location</th>
                            <th>Admin Contact</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($pendingColleges as $pc): ?>
                        <tr>
                            <td class="fw-bold"><?= escape($pc['name']) ?></td>
                            <td><span class="badge bg-secondary"><?= escape($pc['college_code']) ?></span></td>
                            <td><?= escape($pc['city']) ?>, <?= escape($pc['state']) ?></td>
                            <td><?= escape($pc['admin_name']) ?> (<?= escape($pc['admin_email']) ?>)</td>
                            <td>
                                <form method="POST" class="d-inline">
                                    <input type="hidden" name="college_id" value="<?= $pc['id'] ?>">
                                    <button type="submit" name="action" value="approve" class="btn btn-success btn-sm fw-bold">Approve</button>
                                    <button type="submit" name="action" value="reject" class="btn btn-danger btn-sm fw-bold">Reject</button>
                                </form>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
