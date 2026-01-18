<?php
$host = 'localhost';
$db = 'techmarket_db';
$user = 'admin';      // <--- CAMBIO: Usuario por defecto de XAMPP es root
$pass = 'admin';          // <--- CAMBIO: Contraseña por defecto suele ser vacía

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Esto evita que el error rompa el JSON en el frontend
    header('Content-Type: application/json'); 
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}
?>