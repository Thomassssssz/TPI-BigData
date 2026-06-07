<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once "../config/database.php";

try {
    $consultaCursos = $conexion->prepare("
        SELECT 
            c.id_curso,
            c.nombre,
            c.descripcion,
            c.duracion,
            c.modalidad,
            c.precio,
            c.promo,
            c.nivel,
            c.cupos,
            p.nombre AS profesor,
            p.especialidad,
            p.email AS email_profesor,
            p.horario_consulta
        FROM cursos c
        INNER JOIN profesores p ON c.id_profesor = p.id_profesor
        ORDER BY c.id_curso ASC
    ");
    $consultaCursos->execute();
    $cursos = $consultaCursos->fetchAll(PDO::FETCH_ASSOC);

    $consultaArticulos = $conexion->prepare("SELECT * FROM articulos_blog ORDER BY id_articulo ASC");
    $consultaArticulos->execute();
    $articulos = $consultaArticulos->fetchAll(PDO::FETCH_ASSOC);

    $consultaMetricas = $conexion->prepare("SELECT * FROM metricas_campania ORDER BY id_metrica ASC");
    $consultaMetricas->execute();
    $metricas = $consultaMetricas->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "cursos" => $cursos,
        "articulos" => $articulos,
        "metricas" => $metricas
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener datos: " . $e->getMessage()
    ]);
}