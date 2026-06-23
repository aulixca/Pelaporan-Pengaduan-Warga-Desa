<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$result = $conn->query('SELECT id, name, icon, color FROM categories ORDER BY name');
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => $conn->error]);
    exit;
}

$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($categories, JSON_UNESCAPED_UNICODE);
