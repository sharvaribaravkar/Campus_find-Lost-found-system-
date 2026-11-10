<?php
/**
 * CampusFind – Utility and Core Business Functions
 */

function escape($value): string {
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Smart Item Matching Algorithm (PHP Implementation)
 */
function findSmartMatches(PDO $pdo, int $collegeId, int $itemId): array {
    $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
    $stmt->execute([$itemId]);
    $item = $stmt->fetch();
    if (!$item) return [];

    $targetType = $item['type'] === 'lost' ? 'found' : 'lost';

    $stmt2 = $pdo->prepare("
        SELECT * FROM items 
        WHERE college_id = ? 
          AND type = ? 
          AND status = 'active' 
          AND id != ?
    ");
    $stmt2->execute([$collegeId, $targetType, $itemId]);
    $candidates = $stmt2->fetchAll();

    $matches = [];
    $itemTitle = strtolower($item['title']);

    foreach ($candidates as $cand) {
        $score = 0;
        $reasons = [];

        // Category match: 35 points
        if ($cand['category_id'] === $item['category_id']) {
            $score += 35;
            $reasons[] = "Matching item category";
        }

        // Keyword overlap in titles
        $words1 = array_filter(explode(' ', $itemTitle), fn($w) => strlen($w) > 2);
        $words2 = array_filter(explode(' ', strtolower($cand['title'])), fn($w) => strlen($w) > 2);
        $overlap = array_intersect($words1, $words2);

        if (!empty($overlap)) {
            $score += min(45, count($overlap) * 15);
            $reasons[] = "Matching keywords: " . implode(', ', array_slice($overlap, 0, 3));
        }

        // Location proximity
        if (stripos($cand['location_name'], $item['location_name']) !== false || 
            stripos($item['location_name'], $cand['location_name']) !== false) {
            $score += 20;
            $reasons[] = "Similar campus location";
        }

        if ($score >= 40) {
            $matches[] = [
                'candidate' => $cand,
                'score' => min(100, $score),
                'reasons' => $reasons,
            ];
        }
    }

    usort($matches, fn($a, $b) => $b['score'] <=> $a['score']);
    return $matches;
}

function createNotification(PDO $pdo, int $userId, int $collegeId, string $title, string $message, string $type): void {
    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, college_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, 0, NOW())
    ");
    $stmt->execute([$userId, $collegeId, $title, $message, $type]);
}
?>
