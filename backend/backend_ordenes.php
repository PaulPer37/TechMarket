<?php
header('Content-Type: application/json');
require 'db.php';
$metodo = $_SERVER['REQUEST_METHOD'];

try {
    if ($metodo == 'GET') {
        // Obtenemos los pedidos
        $stmt = $pdo->query("SELECT * FROM pedidos ORDER BY id DESC");
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($pedidos);
    }

    if ($metodo == 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // 1. Insertar el pedido principal
        $stmt = $pdo->prepare("INSERT INTO pedidos (usuario_id, total, estado) VALUES (1, ?, 'pendiente')");
        $stmt->execute([$data['total']]);
        $pedidoId = $pdo->lastInsertId();

        // 2. Insertar los detalles (items) si existen
        if (isset($data['items']) && is_array($data['items'])) {
            $sqlDetalle = "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
            $stmtDetalle = $pdo->prepare($sqlDetalle);

            foreach ($data['items'] as $item) {
                // Solo guardamos si es producto (tiene ID de producto)
                if ($item['tipo'] === 'producto') {
                    $stmtDetalle->execute([
                        $pedidoId, 
                        $item['id'], 
                        $item['cantidad'], 
                        $item['precio']
                    ]);
                }
            }
        }

        echo json_encode(["mensaje" => "Orden generada", "id" => $pedidoId]);
    }
} catch (Exception $e) {
    // Enviar error 500 para que el frontend lo detecte
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>