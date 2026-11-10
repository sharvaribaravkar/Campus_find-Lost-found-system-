<?php
/**
 * CampusFind – College Admin Dashboard
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin(['college_admin']);
$user = getCurrentUser();
$collegeId = (int)$user['college_id'];

// Fetch college info
$colStmt = $pdo->prepare("SELECT * FROM colleges WHERE id = ?");
$colStmt->execute([$collegeId]);
$college = $colStmt->fetch();

// Metrics
$studentsCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE college_id = $collegeId AND role = 'student'")->fetchColumn();
$lostCount = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE college_id = $collegeId AND type = 'lost'")->fetchColumn();
$foundCount = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE college_id = $collegeId AND type = 'found'")->fetchColumn();
$pendingClaims = (int)$pdo->query("SELECT COUNT(*) FROM claims WHERE college_id = $collegeId AND status = 'pending'")->fetchColumn();
$returnedCount = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE college_id = $collegeId AND status = 'returned'")->fetchColumn();

// Claims awaiting action
$claimsStmt = $pdo->prepare("
    SELECT c.*, i.title as item_title, u.name as claimant_name, u.roll_number
    FROM claims c
    JOIN items i ON c.item_id = i.id
    JOIN users u ON c.claimant_user_id = u.id
    WHERE c.college_id = ?
    ORDER BY c.created_at DESC
");
$claimsStmt->execute([$collegeId]);
$claims = $claimsStmt->fetchAll();

include __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
    <div class="card rounded-4 border-0 shadow-sm p-4 mb-4 text-white" style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);">
        <span class="badge bg-success text-uppercase mb-1" style="width: fit-content;">College Admin Portal</span>
        <h3 class="fw-bold mb-1"><?= escape($college['name'] ?? 'College') ?></h3>
        <small class="text-white-50">Admin: <?= escape($user['name']) ?> • Campus Code: <?= escape($college['college_code'] ?? '') ?> • Data strictly filtered to college_id: <?= $collegeId ?></small>
    </div>

    <!-- College Stats -->
    <div class="row g-3 mb-4 text-center">
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-primary mb-0"><?= $studentsCount ?></h3>
                <small class="text-muted fw-semibold">Enrolled Students</small>
            </div>
        </div>
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-danger mb-0"><?= $lostCount ?></h3>
                <small class="text-muted fw-semibold">Lost Reports</small>
            </div>
        </div>
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-success mb-0"><?= $foundCount ?></h3>
                <small class="text-muted fw-semibold">Found Items</small>
            </div>
        </div>
        <div class="col-6 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-warning mb-0"><?= $pendingClaims ?></h3>
                <small class="text-muted fw-semibold">Pending Claims</small>
            </div>
        </div>
        <div class="col-12 col-md">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-info mb-0"><?= $returnedCount ?></h3>
                <small class="text-muted fw-semibold">Returned to Owners</small>
            </div>
        </div>
    </div>

    <!-- Claims Table -->
    <div class="card border rounded-4 shadow-sm p-4 bg-white">
        <h5 class="fw-bold mb-3">Ownership Claims for Verification</h5>
        <?php if (empty($claims)): ?>
            <p class="text-muted small py-4 text-center mb-0">No claims submitted yet.</p>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-hover align-middle small">
                    <thead class="table-light">
                        <tr>
                            <th>Claim ID</th>
                            <th>Item</th>
                            <th>Student</th>
                            <th>Reason / Proof</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($claims as $cl): ?>
                        <tr>
                            <td class="font-monospace">#<?= $cl['id'] ?></td>
                            <td class="fw-bold"><?= escape($cl['item_title']) ?></td>
                            <td><?= escape($cl['claimant_name']) ?> (<?= escape($cl['roll_number']) ?>)</td>
                            <td class="text-muted"><?= escape($cl['claim_reason']) ?></td>
                            <td>
                                <span class="badge bg-<?= $cl['status'] === 'approved' ? 'success' : ($cl['status'] === 'pending' ? 'warning' : 'secondary') ?>">
                                    <?= ucfirst($cl['status']) ?>
                                </span>
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
