<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function parse_json_input() {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        send_response(['error' => 'Invalid JSON payload'], 400);
    }
    return $data;
}

function map_user($row) {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'role' => $row['role'],
        'nik' => $row['nik'],
        'phone' => $row['phone'],
        'isActive' => (bool)$row['isActive'],
        'createdAt' => $row['createdAt'],
        'updatedAt' => $row['updatedAt'],
    ];
}

function starts_with($haystack, $needle) {
    if ($needle === '') {
        return true;
    }
    return substr($haystack, 0, strlen($needle)) === $needle;
}

function get_user_by_id($conn, $id) {
    $stmt = $conn->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->bind_param('s', $id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function verify_user_password($plainPassword, $storedPassword, &$needsRehash = false) {
    $needsRehash = false;
    $storedPassword = (string)($storedPassword ?? '');
    $isHashed = starts_with($storedPassword, '$2y$') || starts_with($storedPassword, '$argon2');

    if ($isHashed) {
        if (!password_verify($plainPassword, $storedPassword)) {
            return false;
        }
        $needsRehash = password_needs_rehash($storedPassword, PASSWORD_DEFAULT);
        return true;
    }

    if (hash_equals($storedPassword, $plainPassword)) {
        $needsRehash = true;
        return true;
    }

    return false;
}

function is_admin($userRow) {
    return $userRow && $userRow['role'] === 'admin' && (int)$userRow['isActive'] === 1;
}

function parse_active_value($input, $fallback = 1) {
    if ($input === null) {
        return (int)$fallback;
    }
    if ($input === true || $input === 1 || $input === '1' || $input === 'true') {
        return 1;
    }
    return 0;
}

$input = $method === 'GET' ? [] : parse_json_input();
$actorId = $_GET['actorId'] ?? ($input['actorId'] ?? '');
$actorId = trim((string)$actorId);

if ($actorId === '') {
    send_response(['error' => 'actorId wajib diisi'], 400);
}

$actor = get_user_by_id($conn, $actorId);
if (!$actor || (int)$actor['isActive'] !== 1) {
    send_response(['error' => 'Akses ditolak'], 401);
}

if ($method === 'GET') {
    $requestedId = trim((string)($_GET['id'] ?? ''));

    if ($requestedId !== '') {
        if (!is_admin($actor) && $requestedId !== $actor['id']) {
            send_response(['error' => 'Tidak memiliki izin'], 403);
        }

        $target = get_user_by_id($conn, $requestedId);
        if (!$target) {
            send_response(['error' => 'Pengguna tidak ditemukan'], 404);
        }
        send_response(map_user($target));
    }

    if (!is_admin($actor)) {
        send_response(['error' => 'Hanya admin yang dapat melihat daftar akun'], 403);
    }

    $result = $conn->query('SELECT * FROM users ORDER BY role DESC, createdAt DESC');
    if (!$result) {
        send_response(['error' => $conn->error], 500);
    }

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = map_user($row);
    }
    send_response($users);
}

if ($method === 'POST') {
    if (!is_admin($actor)) {
        send_response(['error' => 'Hanya admin yang dapat menambah akun'], 403);
    }

    $name = trim((string)($input['name'] ?? ''));
    $email = trim((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');
    $role = trim((string)($input['role'] ?? 'warga'));
    $nik = trim((string)($input['nik'] ?? ''));
    $phone = trim((string)($input['phone'] ?? ''));
    $isActive = parse_active_value($input['isActive'] ?? 1, 1);

    if ($name === '' || $email === '' || $password === '') {
        send_response(['error' => 'Nama, email, dan password wajib diisi'], 400);
    }
    if (strlen($password) < 6) {
        send_response(['error' => 'Password minimal 6 karakter'], 400);
    }
    if (!in_array($role, ['admin', 'warga'], true)) {
        send_response(['error' => 'Role tidak valid'], 400);
    }
    if ($role === 'warga' && $nik !== '' && strlen($nik) !== 16) {
        send_response(['error' => 'NIK harus 16 digit'], 400);
    }

    $checkStmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $checkStmt->bind_param('s', $email);
    $checkStmt->execute();
    $exists = $checkStmt->get_result()->fetch_assoc();
    if ($exists) {
        send_response(['error' => 'Email sudah digunakan akun lain'], 409);
    }

    $id = bin2hex(random_bytes(16));
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('INSERT INTO users (id, name, email, passwordHash, role, nik, phone, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssssi', $id, $name, $email, $passwordHash, $role, $nik, $phone, $isActive);
    $saved = $stmt->execute();

    if (!$saved) {
        send_response(['error' => $stmt->error], 500);
    }

    $created = get_user_by_id($conn, $id);
    send_response(['success' => true, 'user' => map_user($created)], 201);
}

if ($method === 'PUT') {
    $targetId = trim((string)($_GET['id'] ?? ($input['id'] ?? '')));
    $action = trim((string)($_GET['action'] ?? ($input['action'] ?? 'update')));

    if ($targetId === '') {
        send_response(['error' => 'ID pengguna wajib diisi'], 400);
    }

    $targetUser = get_user_by_id($conn, $targetId);
    if (!$targetUser) {
        send_response(['error' => 'Pengguna tidak ditemukan'], 404);
    }

    $isActorAdmin = is_admin($actor);
    $isSelfUpdate = $actor['id'] === $targetId;

    if (!$isActorAdmin && !$isSelfUpdate) {
        send_response(['error' => 'Tidak memiliki izin'], 403);
    }

    if ($action === 'password') {
        if (!$isSelfUpdate) {
            send_response(['error' => 'Perubahan password ini hanya untuk akun sendiri'], 403);
        }

        $currentPassword = (string)($input['currentPassword'] ?? '');
        $newPassword = (string)($input['newPassword'] ?? '');
        if ($currentPassword === '' || $newPassword === '') {
            send_response(['error' => 'Password saat ini dan password baru wajib diisi'], 400);
        }
        if (strlen($newPassword) < 6) {
            send_response(['error' => 'Password baru minimal 6 karakter'], 400);
        }

        $needsRehash = false;
        $passwordValid = verify_user_password($currentPassword, $targetUser['passwordHash'], $needsRehash);
        if (!$passwordValid) {
            send_response(['error' => 'Password saat ini salah'], 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $conn->prepare('UPDATE users SET passwordHash = ?, updatedAt = NOW() WHERE id = ?');
        $stmt->bind_param('ss', $newHash, $targetId);
        $updated = $stmt->execute();
        if (!$updated) {
            send_response(['error' => $stmt->error], 500);
        }
        send_response(['success' => true]);
    }

    if ($action === 'admin-reset-password') {
        if (!$isActorAdmin) {
            send_response(['error' => 'Hanya admin yang dapat reset password akun lain'], 403);
        }

        $newPassword = (string)($input['newPassword'] ?? '');
        if ($newPassword === '' || strlen($newPassword) < 6) {
            send_response(['error' => 'Password baru minimal 6 karakter'], 400);
        }

        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $conn->prepare('UPDATE users SET passwordHash = ?, updatedAt = NOW() WHERE id = ?');
        $stmt->bind_param('ss', $newHash, $targetId);
        $updated = $stmt->execute();
        if (!$updated) {
            send_response(['error' => $stmt->error], 500);
        }
        send_response(['success' => true]);
    }

    $name = trim((string)($input['name'] ?? $targetUser['name']));
    $email = trim((string)($input['email'] ?? $targetUser['email']));
    $phone = trim((string)($input['phone'] ?? ($targetUser['phone'] ?? '')));
    $nik = trim((string)($input['nik'] ?? ($targetUser['nik'] ?? '')));

    $role = $targetUser['role'];
    $isActive = (int)$targetUser['isActive'];

    if ($isActorAdmin) {
        if (isset($input['role'])) {
            $incomingRole = trim((string)$input['role']);
            if (!in_array($incomingRole, ['admin', 'warga'], true)) {
                send_response(['error' => 'Role tidak valid'], 400);
            }
            $role = $incomingRole;
        }

        if (array_key_exists('isActive', $input)) {
            $isActive = parse_active_value($input['isActive'], $targetUser['isActive']);
        }

        if ($targetId === $actor['id'] && $isActive === 0) {
            send_response(['error' => 'Admin tidak dapat menonaktifkan akun sendiri'], 400);
        }
    }

    if ($name === '' || $email === '') {
        send_response(['error' => 'Nama dan email wajib diisi'], 400);
    }
    if ($role === 'warga' && $nik !== '' && strlen($nik) !== 16) {
        send_response(['error' => 'NIK harus 16 digit'], 400);
    }

    $dupStmt = $conn->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
    $dupStmt->bind_param('ss', $email, $targetId);
    $dupStmt->execute();
    $duplicate = $dupStmt->get_result()->fetch_assoc();
    if ($duplicate) {
        send_response(['error' => 'Email sudah digunakan akun lain'], 409);
    }

    $updateStmt = $conn->prepare('UPDATE users SET name = ?, email = ?, phone = ?, nik = ?, role = ?, isActive = ?, updatedAt = NOW() WHERE id = ?');
    $updateStmt->bind_param('sssssis', $name, $email, $phone, $nik, $role, $isActive, $targetId);
    $updated = $updateStmt->execute();

    if (!$updated) {
        send_response(['error' => $updateStmt->error], 500);
    }

    $freshUser = get_user_by_id($conn, $targetId);
    send_response(['success' => true, 'user' => map_user($freshUser)]);
}

send_response(['error' => 'Unsupported HTTP method'], 405);
