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

if (
    empty($data["nombre"]) ||
    empty($data["email"]) ||
    empty($data["telefono"]) ||
    empty($data["curso"]) ||
    empty($data["tipoRegistro"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Faltan datos obligatorios."
    ]);
    exit;
}

$nombre = trim($data["nombre"]);
$email = trim($data["email"]);
$telefono = trim($data["telefono"]);
$curso = trim($data["curso"]);
$tipoRegistro = trim($data["tipoRegistro"]);
$fuenteTrafico = !empty($data["fuenteTrafico"]) ? trim($data["fuenteTrafico"]) : "Directo";

function generarCodigo($curso, $tipoRegistro) {
    $cursoLimpio = strtoupper(str_replace([" ", ",", ".", "Á", "É", "Í", "Ó", "Ú"], ["", "", "", "A", "E", "I", "O", "U"], $curso));
    $cursoCorto = substr($cursoLimpio, 0, 8);
    $numero = rand(1000, 9999);

    if ($tipoRegistro === "gratis") {
        return "DEMO-" . $cursoCorto . "-" . $numero;
    }

    return "PAGO-" . $cursoCorto . "-" . $numero;
}

$codigo = generarCodigo($curso, $tipoRegistro);

if ($tipoRegistro === "gratis") {
    $estado = "Acceso habilitado";
    $progreso = 20;
} else {
    $estado = "Pendiente de pago";
    $progreso = 0;
}

try {
    $consulta = $conexion->prepare("
        INSERT INTO usuarios
        (nombre, email, telefono, curso, tipo_registro, codigo_acceso, estado, progreso, fuente_trafico)
        VALUES
        (:nombre, :email, :telefono, :curso, :tipo_registro, :codigo_acceso, :estado, :progreso, :fuente_trafico)
    ");

    $consulta->bindParam(":nombre", $nombre);
    $consulta->bindParam(":email", $email);
    $consulta->bindParam(":telefono", $telefono);
    $consulta->bindParam(":curso", $curso);
    $consulta->bindParam(":tipo_registro", $tipoRegistro);
    $consulta->bindParam(":codigo_acceso", $codigo);
    $consulta->bindParam(":estado", $estado);
    $consulta->bindParam(":progreso", $progreso);
    $consulta->bindParam(":fuente_trafico", $fuenteTrafico);

    $consulta->execute();

    echo json_encode([
        "success" => true,
        "message" => "Registro creado correctamente.",
        "codigo" => $codigo,
        "estado" => $estado
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al registrar usuario: " . $e->getMessage()
    ]);
}