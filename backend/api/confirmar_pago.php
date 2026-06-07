<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data["id_usuario"])) {
    echo json_encode([
        "success" => false,
        "message" => "Falta el ID del usuario."
    ]);
    exit;
}

$idUsuario = $data["id_usuario"];

try {
    $consulta = $conexion->prepare("
        UPDATE usuarios
        SET estado = 'Acceso habilitado',
            progreso = 10
        WHERE id_usuario = :id_usuario
    ");

    $consulta->bindParam(":id_usuario", $idUsuario);
    $consulta->execute();

    echo json_encode([
        "success" => true,
        "message" => "Pago confirmado. El código de acceso quedó habilitado."
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al confirmar pago: " . $e->getMessage()
    ]);
}