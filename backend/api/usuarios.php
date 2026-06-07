<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "../config/database.php";

try {
    $consultaUsuarios = $conexion->prepare("
        SELECT * FROM usuarios
        ORDER BY fecha_registro DESC
    ");
    $consultaUsuarios->execute();
    $usuarios = $consultaUsuarios->fetchAll(PDO::FETCH_ASSOC);

    $consultaResumen = $conexion->prepare("
        SELECT
            COUNT(*) AS total_usuarios,
            SUM(CASE WHEN tipo_registro = 'gratis' THEN 1 ELSE 0 END) AS registros_gratis,
            SUM(CASE WHEN tipo_registro = 'pago' THEN 1 ELSE 0 END) AS registros_pago,
            SUM(CASE WHEN estado = 'Pendiente de pago' THEN 1 ELSE 0 END) AS pagos_pendientes,
            SUM(CASE WHEN estado = 'Acceso habilitado' THEN 1 ELSE 0 END) AS accesos_habilitados
        FROM usuarios
    ");
    $consultaResumen->execute();
    $resumen = $consultaResumen->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios,
        "resumen" => $resumen
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener usuarios: " . $e->getMessage()
    ]);
}