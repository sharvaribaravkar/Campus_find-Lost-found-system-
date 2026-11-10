<?php
/**
 * CampusFind – Student Dashboard
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireLogin(['student']);
$user = getCurrentUser();
$collegeId = (int)$user['college_id'];

// Get user specific stats
$myLost = $pdo->prepare("SELECT COUNT(*) FROM items WHERE user_id = ? AND type = 'lost'");
$myLost->execute([$user['id']]);
$totalLost = (int)$myLost->fetchColumn();

$myFound = $pdo->prepare("SELECT COUNT(*) FROM items WHERE user_id = ? AND type = 'found'");
$myFound->execute([$user['id']]);
$totalFound = (int)$myFound->fetchColumn();

$myClaims = $pdo->prepare("SELECT COUNT(*) FROM claims WHERE claimant_user_id = ? AND status = 'pending'");
$myClaims->execute([$user['id']]);
$pendingClaims = (int)$myClaims->fetchColumn();

$myReturned = $pdo->prepare("SELECT COUNT(*) FROM items WHERE user_id = ? AND status = 'returned'");
$myReturned->execute([$user['id']]);
$returnedCount = (int)$myReturned->fetchColumn();

// Fetch student's reports
$itemsStmt = $pdo->prepare("
    SELECT * FROM items 
    WHERE user_id = ? 
    ORDER BY created_at DESC
");
$itemsStmt->execute([$user['id']]);
$userItems = $itemsStmt->fetchAll();

include __DIR__ . '/../includes/header.php';
?>

<div class="container py-4">
    <div class="card rounded-4 border-0 shadow-sm bg-dark text-white p-4 mb-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
                <span class="badge bg-primary text-uppercase mb-1">Student Portal</span>
                <h3 class="fw-bold mb-0">Welcome, <?= escape($user['name']) ?></h3>
                <small class="text-white-50"><?= escape($user['email']) ?> • College ID: <?= $collegeId ?></small>
            </div>
            <div class="d-flex gap-2">
                <a href="/campusfind/student/report-lost.php" class="btn btn-danger btn-sm px-3 fw-bold">+ Report Lost</a>
                <a href="/campusfind/student/report-found.php" class="btn btn-success btn-sm px-3 fw-bold">+ Report Found</a>
            </div>
        </div>
    </div>

    <!-- Student Stats -->
    <div class="row g-3 mb-4 text-center">
        <div class="col-6 col-md-3">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-danger mb-0"><?= $totalLost ?></h3>
                <small class="text-muted fw-semibold">My Lost Items</small>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-success mb-0"><?= $totalFound ?></h3>
                <small class="text-muted fw-semibold">My Found Reports</small>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-warning mb-0"><?= $pendingClaims ?></h3>
                <small class="text-muted fw-semibold">Pending Claims</small>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="card border rounded-4 shadow-sm p-3 bg-white">
                <h3 class="fw-bold text-info mb-0"><?= $returnedCount ?></h3>
                <small class="text-muted fw-semibold">Recovered Items</small>
            </div>
        </div>
    </div>

    <!-- Student Reports List -->
    <div class="card border rounded-4 shadow-sm p-4 bg-white">
        <h5 class="fw-bold mb-3">Your Reported Campus Belongings</h5>
        <?php if (empty($userItems)): ?>
            <p class="text-muted small py-4 text-center mb-0">You have not reported any items yet.</p>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-hover align-middle small">
                    <thead class="table-light">
                        <tr>
                            <th>Item</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($userItems as $it): ?>
                        <tr>
                            <td class="fw-bold"><?= escape($it['title']) ?></td>
                            <td>
                                <span class="badge bg-<?= $it['type'] === 'lost' ? 'danger' : 'success' ?>">
                                    <?= ucfirst($it['type']) ?>
                                </span>
                            </td>
                            <td><?= escape($it['location_name']) ?></td>
                            <td><?= escape($it['date_occurred']) ?></td>
                            <td><span class="badge bg-secondary"><?= ucfirst($it['status']) ?></span></td>
                            <td>
                                <a href="/campusfind/student/item-details.php?id=<?= $it['id'] ?>" class="btn btn-sm btn-outline-primary">View</a>
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
