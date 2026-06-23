<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function parse_json_input() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        send_response(['error' => 'Invalid JSON payload'], 400);
    }
    return $data;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    $actorId = $_GET['actorId'] ?? '';

    if ($id === '' || $actorId === '') {
        send_response(['error' => 'Report id dan actorId wajib diisi'], 400);
    }

    $checkStmt = $conn->prepare('SELECT id, userId FROM reports WHERE id = ? LIMIT 1');
    $checkStmt->bind_param('s', $id);
    $checkStmt->execute();
    $report = $checkStmt->get_result()->fetch_assoc();

    if (!$report) {
        send_response(['error' => 'Report not found'], 404);
    }

    if ($report['userId'] !== $actorId) {
        send_response(['error' => 'Hanya pemilik laporan yang dapat menghapus'], 403);
    }

    $deleteStmt = $conn->prepare('DELETE FROM reports WHERE id = ? AND userId = ?');
    $deleteStmt->bind_param('ss', $id, $actorId);
    $success = $deleteStmt->execute();

    if (!$success) {
        send_response(['error' => $deleteStmt->error], 500);
    }

    if ($deleteStmt->affected_rows === 0) {
        send_response(['error' => 'Report not found'], 404);
    }

    send_response(['success' => true]);
}

if ($method === 'GET') {
    if (!empty($_GET['id'])) {
        $stmt = $conn->prepare('SELECT * FROM reports WHERE id = ?');
        $stmt->bind_param('s', $_GET['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $report = $result->fetch_assoc();
        if (!$report) {
            send_response(['error' => 'Report not found'], 404);
        }
        $report['photos'] = json_decode($report['photos'] ?? '[]', true);
        $report['progress'] = json_decode($report['progress'] ?? '[]', true);
        send_response($report);
    }

    $result = $conn->query('SELECT * FROM reports ORDER BY createdAt DESC');
    if (!$result) {
        send_response(['error' => $conn->error], 500);
    }
    $reports = [];
    while ($row = $result->fetch_assoc()) {
        $row['photos'] = json_decode($row['photos'] ?? '[]', true);
        $row['progress'] = json_decode($row['progress'] ?? '[]', true);
        $reports[] = $row;
    }
    send_response($reports);
}

if ($method === 'POST' || $method === 'PUT') {
    $data = parse_json_input();

    if (empty($data['id']) || empty($data['userId']) || empty($data['userName']) || empty($data['title']) || empty($data['description']) || empty($data['category']) || empty($data['location']) || empty($data['status']) || empty($data['createdAt']) || empty($data['updatedAt']) || !isset($data['photos']) || !isset($data['progress'])) {
        send_response(['error' => 'Missing required report fields'], 400);
    }

    $photosJson = json_encode($data['photos'], JSON_UNESCAPED_UNICODE);
    $progressJson = json_encode($data['progress'], JSON_UNESCAPED_UNICODE);
    $adminNote = $data['adminNote'] ?? null;
    $alasanPenolakan = $data['alasan_penolakan'] ?? ($data['alasanPenolakan'] ?? null);

    if ($adminNote === null && $alasanPenolakan !== null) {
        $adminNote = $alasanPenolakan;
    }

    if ($method === 'POST') {
        $stmt = $conn->prepare('INSERT INTO reports (id, userId, userName, title, description, category, location, status, photos, progress, adminNote, alasan_penolakan, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('ssssssssssssss', $data['id'], $data['userId'], $data['userName'], $data['title'], $data['description'], $data['category'], $data['location'], $data['status'], $photosJson, $progressJson, $adminNote, $alasanPenolakan, $data['createdAt'], $data['updatedAt']);
        $success = $stmt->execute();
        if (!$success) {
            send_response(['error' => $stmt->error], 500);
        }
        send_response(['success' => true, 'id' => $data['id']], 201);
    }

    $id = $_GET['id'] ?? $data['id'];
    $actorId = $_GET['actorId'] ?? ($data['actorId'] ?? '');

    if ($actorId !== '') {
        $ownerStmt = $conn->prepare('SELECT userId FROM reports WHERE id = ? LIMIT 1');
        $ownerStmt->bind_param('s', $id);
        $ownerStmt->execute();
        $ownerRow = $ownerStmt->get_result()->fetch_assoc();

        if (!$ownerRow) {
            send_response(['error' => 'Report not found'], 404);
        }

        $isOwner = $ownerRow['userId'] === $actorId;
        if (!$isOwner) {
            send_response(['error' => 'Hanya pemilik laporan yang dapat mengedit'], 403);
        }
    }

    $stmt = $conn->prepare('UPDATE reports SET userId = ?, userName = ?, title = ?, description = ?, category = ?, location = ?, status = ?, photos = ?, progress = ?, adminNote = ?, alasan_penolakan = ?, updatedAt = ? WHERE id = ?');
    $stmt->bind_param('sssssssssssss', $data['userId'], $data['userName'], $data['title'], $data['description'], $data['category'], $data['location'], $data['status'], $photosJson, $progressJson, $adminNote, $alasanPenolakan, $data['updatedAt'], $id);
    $success = $stmt->execute();
    if (!$success) {
        send_response(['error' => $stmt->error], 500);
    }
    if ($stmt->affected_rows === 0) {
        send_response(['error' => 'Report not found or no changes made'], 404);
    }
    send_response(['success' => true]);
}

send_response(['error' => 'Unsupported HTTP method'], 405);
