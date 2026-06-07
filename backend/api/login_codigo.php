<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data["codigo"])) {
    echo json_encode([
        "success" => false,
        "message" => "Debe ingresar un código de acceso."
    ]);
    exit;
}

$codigo = trim($data["codigo"]);

try {
    $consulta = $conexion->prepare("
        SELECT * FROM usuarios
        WHERE codigo_acceso = :codigo
        LIMIT 1
    ");
    $consulta->bindParam(":codigo", $codigo);
    $consulta->execute();

    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        echo json_encode([
            "success" => false,
            "message" => "El código ingresado no existe."
        ]);
        exit;
    }

    if ($usuario["estado"] === "Pendiente de pago") {
        echo json_encode([
            "success" => false,
            "message" => "Tu inscripción existe, pero el acceso todavía está pendiente de pago."
        ]);
        exit;
    }

    $consultaMateriales = $conexion->prepare("
        SELECT * FROM materiales
        WHERE curso = :curso
        ORDER BY id_material ASC
    ");
    $consultaMateriales->bindParam(":curso", $usuario["curso"]);
    $consultaMateriales->execute();

    $materiales = $consultaMateriales->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "message" => "Ingreso correcto.",
        "usuario" => $usuario,
        "materiales" => $materiales
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al ingresar: " . $e->getMessage()
    ]);
}