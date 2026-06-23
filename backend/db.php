<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

function load_env_file($path) {
    if (!is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }

        $equalPos = strpos($line, '=');
        if ($equalPos === false) {
            continue;
        }

        $key = trim(substr($line, 0, $equalPos));
        $value = trim(substr($line, $equalPos + 1));

        if ($key === '') {
            continue;
        }

        $isQuoted = strlen($value) >= 2 && (
            ($value[0] === '"' && substr($value, -1) === '"') ||
            ($value[0] === "'" && substr($value, -1) === "'")
        );
        if ($isQuoted) {
            $value = substr($value, 1, -1);
        }

        if (getenv($key) === false) {
            putenv($key . '=' . $value);
        }
        $_ENV[$key] = $value;
    }
}

function load_env_files_once() {
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    $baseDir = __DIR__;
    load_env_file($baseDir . DIRECTORY_SEPARATOR . '.env');
    load_env_file(dirname($baseDir) . DIRECTORY_SEPARATOR . '.env');
}

function env_value($key, $default = null) {
    $value = getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }
    return $value;
}

load_env_files_once();

$host = env_value('DB_HOST', '127.0.0.1');
$user = env_value('DB_USER', 'root');
$password = env_value('DB_PASSWORD', '');
$database = env_value('DB_NAME', 'pelaporan_desa');

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => $conn->connect_error]);
    exit;
}
$conn->set_charset('utf8mb4');

function send_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
