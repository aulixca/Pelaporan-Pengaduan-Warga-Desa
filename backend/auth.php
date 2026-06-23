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

function generate_uuid() {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
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

function encode_mime_header($text) {
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

function smtp_read_response($socket) {
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) < 4) {
            break;
        }
        if ($line[3] === ' ') {
            break;
        }
    }
    return trim($response);
}

function smtp_send_command($socket, $command, $expectedCodes) {
    if (!is_array($expectedCodes)) {
        $expectedCodes = [$expectedCodes];
    }

    if (fwrite($socket, $command . "\r\n") === false) {
        throw new Exception('Gagal mengirim perintah SMTP');
    }

    $response = smtp_read_response($socket);
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $expectedCodes, true)) {
        throw new Exception('SMTP menolak perintah "' . $command . '" dengan respons: ' . $response);
    }
    return $response;
}

function smtp_escape_data($data) {
    $normalized = str_replace(["\r\n", "\r"], "\n", $data);
    $lines = explode("\n", $normalized);
    foreach ($lines as &$line) {
        if ($line !== '' && $line[0] === '.') {
            $line = '.' . $line;
        }
    }
    return implode("\r\n", $lines);
}

function send_reset_code_via_smtp($recipientEmail, $resetCode, $expiresAt) {
    $host = trim((string)env_value('SMTP_HOST', ''));
    $port = (int)env_value('SMTP_PORT', 0);
    $username = trim((string)env_value('SMTP_USERNAME', ''));
    $password = (string)env_value('SMTP_PASSWORD', '');
    $fromEmail = trim((string)env_value('SMTP_FROM_EMAIL', ''));
    $fromName = trim((string)env_value('SMTP_FROM_NAME', 'Sistem Pelaporan Warga'));
    $encryption = strtolower(trim((string)env_value('SMTP_ENCRYPTION', 'tls')));
    $timeout = (int)env_value('SMTP_TIMEOUT', 15);

    if ($host === '' || $port <= 0 || $fromEmail === '') {
        return [false, 'Konfigurasi SMTP belum lengkap. Isi SMTP_HOST, SMTP_PORT, dan SMTP_FROM_EMAIL.'];
    }

    if ($username !== '' && $password === '') {
        return [false, 'SMTP_PASSWORD wajib diisi jika SMTP_USERNAME digunakan.'];
    }

    $expiresDate = strtotime($expiresAt);
    $expiresText = $expiresDate ? date('d M Y H:i', $expiresDate) : $expiresAt;
    $subjectText = 'Kode Reset Password - Sistem Pelaporan Pengaduan Warga';

    $textBody = "Halo,\n\n" .
        "Kami menerima permintaan reset password untuk akun Anda.\n" .
        "Gunakan kode berikut untuk melanjutkan reset password:\n\n" .
        $resetCode . "\n\n" .
        "Kode berlaku sampai: " . $expiresText . "\n\n" .
        "Jika Anda tidak melakukan permintaan ini, abaikan email ini.\n\n" .
        "Terima kasih.";

    $htmlBody = '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">' .
        '<h2 style="margin:0 0 12px 0;color:#111827">Reset Password</h2>' .
        '<p>Kami menerima permintaan reset password untuk akun Anda.</p>' .
        '<p>Gunakan kode berikut untuk melanjutkan:</p>' .
        '<div style="display:inline-block;padding:12px 16px;border:1px solid #d1d5db;border-radius:8px;background:#f9fafb;font-size:24px;letter-spacing:6px;font-weight:700;color:#111827">' .
        htmlspecialchars($resetCode, ENT_QUOTES, 'UTF-8') .
        '</div>' .
        '<p style="margin-top:16px">Kode berlaku sampai: <strong>' . htmlspecialchars($expiresText, ENT_QUOTES, 'UTF-8') . '</strong></p>' .
        '<p>Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>' .
        '</div>';

    $transportHost = $encryption === 'ssl' ? 'ssl://' . $host : $host;
    $address = $transportHost . ':' . $port;

    $socket = @stream_socket_client($address, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT);
    if (!$socket) {
        return [false, 'Tidak dapat terhubung ke server SMTP: ' . $errstr];
    }

    stream_set_timeout($socket, $timeout);

    try {
        $greeting = smtp_read_response($socket);
        if ((int)substr($greeting, 0, 3) !== 220) {
            throw new Exception('SMTP greeting tidak valid: ' . $greeting);
        }

        $hostname = gethostname();
        if (!$hostname) {
            $hostname = 'localhost';
        }

        smtp_send_command($socket, 'EHLO ' . $hostname, 250);

        if ($encryption === 'tls') {
            smtp_send_command($socket, 'STARTTLS', 220);
            $cryptoMethod = defined('STREAM_CRYPTO_METHOD_TLS_CLIENT')
                ? STREAM_CRYPTO_METHOD_TLS_CLIENT
                : STREAM_CRYPTO_METHOD_ANY_CLIENT;
            $cryptoEnabled = @stream_socket_enable_crypto($socket, true, $cryptoMethod);
            if ($cryptoEnabled !== true) {
                throw new Exception('Gagal melakukan negosiasi TLS');
            }
            smtp_send_command($socket, 'EHLO ' . $hostname, 250);
        }

        if ($username !== '') {
            smtp_send_command($socket, 'AUTH LOGIN', 334);
            smtp_send_command($socket, base64_encode($username), 334);
            smtp_send_command($socket, base64_encode($password), 235);
        }

        smtp_send_command($socket, 'MAIL FROM:<' . $fromEmail . '>', 250);
        smtp_send_command($socket, 'RCPT TO:<' . $recipientEmail . '>', [250, 251]);
        smtp_send_command($socket, 'DATA', 354);

        $boundary = 'bnd_' . bin2hex(random_bytes(8));
        $message = '';
        $message .= 'Date: ' . date('r') . "\r\n";
        $message .= 'From: ' . encode_mime_header($fromName) . ' <' . $fromEmail . ">\r\n";
        $message .= 'To: <' . $recipientEmail . ">\r\n";
        $message .= 'Subject: ' . encode_mime_header($subjectText) . "\r\n";
        $message .= "MIME-Version: 1.0\r\n";
        $message .= 'Content-Type: multipart/alternative; boundary="' . $boundary . "\"\r\n";
        $message .= "\r\n";
        $message .= '--' . $boundary . "\r\n";
        $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $message .= chunk_split(base64_encode($textBody), 76, "\r\n");
        $message .= '--' . $boundary . "\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $message .= chunk_split(base64_encode($htmlBody), 76, "\r\n");
        $message .= '--' . $boundary . "--\r\n";

        $payload = smtp_escape_data($message) . "\r\n.\r\n";
        if (fwrite($socket, $payload) === false) {
            throw new Exception('Gagal mengirim isi email ke SMTP');
        }

        $sendResponse = smtp_read_response($socket);
        if ((int)substr($sendResponse, 0, 3) !== 250) {
            throw new Exception('SMTP menolak isi email: ' . $sendResponse);
        }

        smtp_send_command($socket, 'QUIT', 221);
        fclose($socket);
        return [true, null];
    } catch (Throwable $error) {
        if (is_resource($socket)) {
            @fwrite($socket, "QUIT\r\n");
            fclose($socket);
        }
        return [false, $error->getMessage()];
    }
}

$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $input = parse_json_input();
    $email = trim((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');

    if ($email === '' || $password === '') {
        send_response(['error' => 'Email dan password wajib diisi'], 400);
    }

    $stmt = $conn->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        send_response(['error' => 'Email atau password salah'], 401);
    }

    if ((int)$user['isActive'] !== 1) {
        send_response(['error' => 'Akun dinonaktifkan. Hubungi admin.'], 403);
    }

    $needsRehash = false;
    $validPassword = verify_user_password($password, $user['passwordHash'], $needsRehash);
    if (!$validPassword) {
        send_response(['error' => 'Email atau password salah'], 401);
    }

    if ($needsRehash) {
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $rehashStmt = $conn->prepare('UPDATE users SET passwordHash = ?, updatedAt = NOW() WHERE id = ?');
        $rehashStmt->bind_param('ss', $newHash, $user['id']);
        $rehashStmt->execute();
    }

    send_response(['success' => true, 'user' => map_user($user)]);
}

if ($method === 'POST' && $action === 'register') {
    $input = parse_json_input();

    $name = trim((string)($input['name'] ?? ''));
    $email = trim((string)($input['email'] ?? ''));
    $password = (string)($input['password'] ?? '');
    $nik = trim((string)($input['nik'] ?? ''));
    $phone = trim((string)($input['phone'] ?? ''));

    if ($name === '' || $email === '' || $password === '' || $nik === '' || $phone === '') {
        send_response(['error' => 'Semua data wajib diisi'], 400);
    }

    if (strlen($password) < 6) {
        send_response(['error' => 'Password minimal 6 karakter'], 400);
    }

    if (strlen($nik) !== 16) {
        send_response(['error' => 'NIK harus 16 digit'], 400);
    }

    $checkStmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $checkStmt->bind_param('s', $email);
    $checkStmt->execute();
    $existing = $checkStmt->get_result()->fetch_assoc();
    if ($existing) {
        send_response(['error' => 'Email sudah terdaftar'], 409);
    }

    $id = generate_uuid();
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'warga';
    $isActive = 1;

    $stmt = $conn->prepare('INSERT INTO users (id, name, email, passwordHash, role, nik, phone, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssssi', $id, $name, $email, $passwordHash, $role, $nik, $phone, $isActive);
    $success = $stmt->execute();

    if (!$success) {
        send_response(['error' => $stmt->error], 500);
    }

    $userRow = [
        'id' => $id,
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'nik' => $nik,
        'phone' => $phone,
        'isActive' => $isActive,
        'createdAt' => date('Y-m-d H:i:s'),
        'updatedAt' => date('Y-m-d H:i:s'),
    ];

    send_response(['success' => true, 'user' => map_user($userRow)], 201);
}

if ($method === 'POST' && $action === 'forgot-password-request') {
    $input = parse_json_input();
    $email = trim((string)($input['email'] ?? ''));

    if ($email === '') {
        send_response(['error' => 'Email wajib diisi'], 400);
    }

    $stmt = $conn->prepare('SELECT id, isActive FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    $response = [
        'success' => true,
        'message' => 'Jika email terdaftar, kode reset telah dikirim.',
    ];

    if (!$user || (int)$user['isActive'] !== 1) {
        send_response($response);
    }

    $deleteStmt = $conn->prepare('DELETE FROM password_reset_tokens WHERE userId = ? AND usedAt IS NULL');
    $deleteStmt->bind_param('s', $user['id']);
    $deleteStmt->execute();

    $resetCode = (string)random_int(100000, 999999);
    $tokenHash = password_hash($resetCode, PASSWORD_DEFAULT);
    $expiresAt = date('Y-m-d H:i:s', time() + (15 * 60));

    $insertStmt = $conn->prepare('INSERT INTO password_reset_tokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)');
    $insertStmt->bind_param('sss', $user['id'], $tokenHash, $expiresAt);
    $saved = $insertStmt->execute();

    if (!$saved) {
        send_response(['error' => $insertStmt->error], 500);
    }

    list($mailSent, $mailError) = send_reset_code_via_smtp($email, $resetCode, $expiresAt);
    if (!$mailSent) {
        error_log('[RESET_PASSWORD_EMAIL_ERROR] ' . $mailError);
        $cleanupStmt = $conn->prepare('DELETE FROM password_reset_tokens WHERE userId = ? AND usedAt IS NULL');
        $cleanupStmt->bind_param('s', $user['id']);
        $cleanupStmt->execute();
        send_response(['error' => 'Gagal mengirim kode reset. Coba lagi beberapa saat.'], 500);
    }

    send_response($response);
}

if ($method === 'POST' && $action === 'forgot-password-reset') {
    $input = parse_json_input();
    $email = trim((string)($input['email'] ?? ''));
    $resetCode = trim((string)($input['resetCode'] ?? ''));
    $newPassword = (string)($input['newPassword'] ?? '');

    if ($email === '' || $resetCode === '' || $newPassword === '') {
        send_response(['error' => 'Email, kode reset, dan password baru wajib diisi'], 400);
    }

    if (strlen($newPassword) < 6) {
        send_response(['error' => 'Password minimal 6 karakter'], 400);
    }

    $userStmt = $conn->prepare('SELECT id, isActive FROM users WHERE email = ? LIMIT 1');
    $userStmt->bind_param('s', $email);
    $userStmt->execute();
    $user = $userStmt->get_result()->fetch_assoc();

    if (!$user || (int)$user['isActive'] !== 1) {
        send_response(['error' => 'Permintaan reset tidak valid'], 400);
    }

    $tokenStmt = $conn->prepare(
        'SELECT id, tokenHash, expiresAt FROM password_reset_tokens
         WHERE userId = ? AND usedAt IS NULL AND expiresAt >= NOW()
         ORDER BY createdAt DESC LIMIT 5'
    );
    $tokenStmt->bind_param('s', $user['id']);
    $tokenStmt->execute();
    $tokenRows = $tokenStmt->get_result();

    $matchedTokenId = null;
    while ($row = $tokenRows->fetch_assoc()) {
        if (password_verify($resetCode, $row['tokenHash'])) {
            $matchedTokenId = $row['id'];
            break;
        }
    }

    if ($matchedTokenId === null) {
        send_response(['error' => 'Kode reset tidak valid atau sudah kadaluarsa'], 400);
    }

    $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $updatePassStmt = $conn->prepare('UPDATE users SET passwordHash = ?, updatedAt = NOW() WHERE id = ?');
    $updatePassStmt->bind_param('ss', $newPasswordHash, $user['id']);
    $updated = $updatePassStmt->execute();
    if (!$updated) {
        send_response(['error' => $updatePassStmt->error], 500);
    }

    $markUsedStmt = $conn->prepare('UPDATE password_reset_tokens SET usedAt = NOW() WHERE userId = ? AND usedAt IS NULL');
    $markUsedStmt->bind_param('s', $user['id']);
    $markUsedStmt->execute();

    send_response(['success' => true, 'message' => 'Password berhasil direset']);
}

send_response(['error' => 'Unsupported auth action'], 405);
