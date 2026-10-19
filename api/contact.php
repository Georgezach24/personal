<?php
/*
 * Contact form handler (optional; for PHP hosting only).
 *
 * Accepts a POST from the form in index.html and emails it to you.
 * Always answers with JSON: {"ok": true} or {"ok": false, "error": "..."}.
 * Settings live in api/config.php (copy api/config.example.php).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Remove line breaks so values can't inject extra mail headers. */
function header_safe(string $value): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', $value));
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    respond(500, ['ok' => false, 'error' => 'Contact form is not configured.']);
}
$config = require $configFile;

// ---- CORS (only needed when the site and this script are on different domains) ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $config['allowed_origins'] ?? [], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Accept, Content-Type');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    respond(204, ['ok' => true]);
}
if ($method !== 'POST') {
    header('Allow: POST, OPTIONS');
    respond(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

// ---- Spam protection ----
// Honeypot: real visitors never see this field.
if (!empty($_POST['_gotcha'])) {
    respond(200, ['ok' => true]);
}

session_start();
$wait = (int) ($config['rate_limit_seconds'] ?? 30);
$last = (int) ($_SESSION['contact_last_sent'] ?? 0);
if ($wait > 0 && time() - $last < $wait) {
    respond(429, ['ok' => false, 'error' => 'Please wait a moment before sending another message.']);
}

// ---- Validation ----
$name    = trim((string) ($_POST['name'] ?? ''));
$email   = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

$errors = [];
if ($name === '' || mb_strlen($name) > 100) {
    $errors[] = 'name';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    $errors[] = 'email';
}
if (mb_strlen($subject) > 150) {
    $errors[] = 'subject';
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    $errors[] = 'message';
}
if ($errors) {
    respond(422, ['ok' => false, 'error' => 'Invalid fields: ' . implode(', ', $errors)]);
}

// ---- Send ----
$prefix      = (string) ($config['subject_prefix'] ?? '[Website]');
$mailSubject = header_safe($prefix . ' ' . ($subject !== '' ? $subject : 'New message from ' . $name));
$encodedSubject = '=?UTF-8?B?' . base64_encode($mailSubject) . '?=';

$body = "Name: {$name}\n"
      . "Email: {$email}\n"
      . 'Sent: ' . date('Y-m-d H:i:s') . "\n"
      . "------------------------------\n\n"
      . $message . "\n";

$headers = [
    'From: ' . header_safe((string) $config['from_email']),
    'Reply-To: ' . header_safe($name) . ' <' . header_safe($email) . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail((string) $config['to_email'], $encodedSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(500, ['ok' => false, 'error' => 'The message could not be sent.']);
}

$_SESSION['contact_last_sent'] = time();
respond(200, ['ok' => true]);
