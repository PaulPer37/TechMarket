<!-- Anthony Herrera -->
<?php
header('Content-Type: application/json');
require 'db.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo == 'GET') {
    $stmt = $pdo->query("SELECT * FROM pedidos");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
if ($metodo == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO pedidos (usuario_id, total, estado) VALUES (1, ?, 'pendiente')");
    $stmt->execute([$data['total']]);
    echo json_encode(["mensaje" => "Orden generada", "id" => $pdo->lastInsertId()]);
}
?>