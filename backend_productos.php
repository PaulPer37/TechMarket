<?php
header('Content-Type: application/json');
require 'db.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo == 'GET') {
    $stmt = $pdo->query("SELECT * FROM productos");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
if ($metodo == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO productos (nombre, descripcion, precio, stock, categoria, vendedor_id) VALUES (?, ?, ?, ?, ?, 1)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data['nombre'], $data['descripcion'], $data['precio'], $data['stock'], $data['categoria']]);
    echo json_encode(["mensaje" => "Producto creado", "id" => $pdo->lastInsertId()]);
}
?>
