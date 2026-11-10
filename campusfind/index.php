<?php
/**
 * CampusFind – One Platform, Every Campus
 * Landing Page (PHP 8+ / MySQL PDO)
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';

// Fetch dynamic database stats
$collegesCount = (int)$pdo->query("SELECT COUNT(*) FROM colleges WHERE status = 'approved'")->fetchColumn();
$studentsCount = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
$lostCount = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE type = 'lost'")->fetchColumn();
$foundCount = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE type = 'found'")->fetchColumn();
$returnedCount = (int)$pdo->query("SELECT COUNT(*) FROM items WHERE status = 'returned'")->fetchColumn();

// Fetch recent lost items
$stmtLost = $pdo->prepare("
    SELECT i.*, c.code as college_code, cat.name as category_name
    FROM items i
    JOIN colleges c ON i.college_id = c.id
    JOIN categories cat ON i.category_id = cat.id
    WHERE i.type = 'lost' AND i.status = 'active'
    ORDER BY i.created_at DESC LIMIT 4
");
$stmtLost->execute();
$recentLost = $stmtLost->fetchAll();

// Fetch recent found items
$stmtFound = $pdo->prepare("
    SELECT i.*, c.code as college_code, cat.name as category_name, f.deposit_location
    FROM items i
    JOIN colleges c ON i.college_id = c.id
    JOIN categories cat ON i.category_id = cat.id
    LEFT JOIN found_items f ON i.id = f.item_id
    WHERE i.type = 'found' AND i.status = 'active'
    ORDER BY i.created_at DESC LIMIT 4
");
$stmtFound->execute();
$recentFound = $stmtFound->fetchAll();

include __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<section class="bg-dark text-white py-5 position-relative text-center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
    <div class="container py-4">
        <span class="badge bg-primary px-3 py-2 rounded-pill text-uppercase mb-3">One Platform, Every Campus</span>
        <h1 class="display-4 fw-bold">Lost Something on Campus? <br><span class="text-info">Let's Find It!</span></h1>
        <p class="lead text-light opacity-75 max-w-700 mx-auto">
            CampusFind connects students across colleges to report, track, match, and recover lost belongings with verified security handovers.
        </p>

        <!-- Search Form -->
        <div class="row justify-content-center my-4">
            <div class="col-md-7">
                <form action="/campusfind/student/lost-items.php" method="GET" class="input-group shadow-lg">
                    <input type="text" name="q" class="form-control form-control-lg border-0" placeholder="Search earbuds, scientific calculators, wallets, water bottles...">
                    <button class="btn btn-primary px-4 fw-bold" type="submit">Search Campus</button>
                </form>
            </div>
        </div>

        <div class="d-flex justify-content-center gap-3 pt-2">
            <a href="/campusfind/student/report-lost.php" class="btn btn-danger btn-lg px-4 shadow">Report Lost Item</a>
            <a href="/campusfind/student/report-found.php" class="btn btn-success btn-lg px-4 shadow">Report Found Item</a>
        </div>
    </div>
</section>

<!-- Dynamic Statistics -->
<section class="container my-n4 position-relative" style="margin-top: -30px; z-index: 10;">
    <div class="bg-white rounded-4 shadow p-4 border">
        <div class="row text-center g-3">
            <div class="col-6 col-md">
                <h2 class="fw-bold text-primary mb-0"><?= $collegesCount ?></h2>
                <small class="text-muted fw-semibold">Registered Colleges</small>
            </div>
            <div class="col-6 col-md">
                <h2 class="fw-bold text-info mb-0"><?= $studentsCount ?></h2>
                <small class="text-muted fw-semibold">Registered Students</small>
            </div>
            <div class="col-6 col-md">
                <h2 class="fw-bold text-danger mb-0"><?= $lostCount ?></h2>
                <small class="text-muted fw-semibold">Lost Items</small>
            </div>
            <div class="col-6 col-md">
                <h2 class="fw-bold text-success mb-0"><?= $foundCount ?></h2>
                <small class="text-muted fw-semibold">Found Items</small>
            </div>
            <div class="col-12 col-md">
                <h2 class="fw-bold text-warning mb-0"><?= $returnedCount ?></h2>
                <small class="text-muted fw-semibold">Successfully Returned</small>
            </div>
        </div>
    </div>
</section>

<!-- Recently Lost Items -->
<section class="container my-5 py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <span class="text-danger fw-bold text-uppercase small">Active Searches</span>
            <h2 class="fw-bold">Recently Lost on Campus</h2>
        </div>
        <a href="/campusfind/student/lost-items.php" class="btn btn-outline-primary btn-sm">View All Lost Items &rarr;</a>
    </div>

    <div class="row g-4">
        <?php foreach ($recentLost as $item): ?>
        <div class="col-md-3">
            <div class="card h-100 rounded-4 shadow-sm border-0 overflow-hidden">
                <img src="<?= escape($item['image_url']) ?>" class="card-img-top" style="height: 180px; object-fit: cover;">
                <div class="card-body">
                    <span class="badge bg-danger mb-2">Lost</span>
                    <span class="badge bg-secondary mb-2"><?= escape($item['college_code']) ?></span>
                    <h6 class="card-title fw-bold text-truncate"><?= escape($item['title']) ?></h6>
                    <p class="card-text text-muted small text-truncate-2"><?= escape($item['description']) ?></p>
                    <p class="small text-muted mb-0">📍 <?= escape($item['location_name']) ?></p>
                </div>
                <div class="card-footer bg-white border-0 pt-0">
                    <a href="/campusfind/student/item-details.php?id=<?= $item['id'] ?>" class="btn btn-light btn-sm w-100">View Details</a>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<?php include __DIR__ . '/includes/footer.php'; ?>
