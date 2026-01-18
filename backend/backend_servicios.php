<?php
header('Content-Type: application/json');
require 'db.php';
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo == 'GET') {
    $stmt = $pdo->query("SELECT * FROM servicios");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
if ($metodo == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO servicios (titulo, descripcion, costo_base, horario_atencion, tecnico_id) VALUES (?, ?, ?, ?, 1)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$data['titulo'], $data['descripcion'], $data['costo_base'], $data['horario_atencion']]);
    echo json_encode(["mensaje" => "Servicio publicado"]);
}
?>