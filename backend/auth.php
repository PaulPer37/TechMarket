<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
require_once 'db.php';

// Response helper
function sendResponse($success, $message, $data = null)
{
    $response = [
        'success' => $success,
        'message' => $message
    ];

    if ($data !== null) {
        $response = array_merge($response, $data);
    }

    echo json_encode($response);
    exit();
}

// Get action
$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        handleRegister($pdo);
        break;
    case 'login':
        handleLogin($pdo);
        break;
    case 'check':
        handleCheck();
        break;
    default:
        sendResponse(false, 'Acción no especificada');
}

/**
 * Handle user registration
 */
function handleRegister($pdo)
{
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $rol = $_POST['rol'] ?? 'comprador';

    // Validations
    if (empty($nombre) || empty($email) || empty($password)) {
        sendResponse(false, 'Todos los campos son obligatorios');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, 'El correo electrónico no es válido');
    }

    if (strlen($password) < 6) {
        sendResponse(false, 'La contraseña debe tener al menos 6 caracteres');
    }

    // Validate rol
    if (!in_array($rol, ['comprador', 'vendedor'])) {
        $rol = 'comprador';
    }

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        sendResponse(false, 'Este correo electrónico ya está registrado');
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)");

    if ($stmt->execute([$nombre, $email, $hashedPassword, $rol])) {
        sendResponse(true, 'Cuenta creada exitosamente');
    } else {
        sendResponse(false, 'Error al crear la cuenta. Intenta nuevamente.');
    }
}

/**
 * Handle user login
 */
function handleLogin($pdo)
{
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendResponse(false, 'Por favor ingresa tu correo y contraseña');
    }

    // Get user by email
    $stmt = $pdo->prepare("SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendResponse(false, 'No existe una cuenta con este correo electrónico');
    }

    // Verify password
    if ($user['password'] === null) {
        sendResponse(false, 'Debes establecer una contraseña. Contacta al administrador.');
    }

    if (!password_verify($password, $user['password'])) {
        sendResponse(false, 'Contraseña incorrecta');
    }

    // Remove password from response
    unset($user['password']);

    sendResponse(true, 'Inicio de sesión exitoso', ['user' => $user]);
}

/**
 * Check if API is working
 */
function handleCheck()
{
    sendResponse(true, 'API funcionando');
}
?>