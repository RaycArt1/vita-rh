
import * as horarioService from "./horario.service.js";

export async function obtenerHorarios(req, res) {
  try {
    const horarios = await horarioService.obtenerHorarios();
    return res.json(horarios);
  } catch (error) {
    console.error("Error al obtener horarios:", error);

    return res.status(500).json({
      mensaje: "No se pudieron obtener los horarios.",
    });
  }
}

export async function crearHorario(req, res) {
  try {
    const horario = await horarioService.crearHorario({
      ...req.body,
      creadoPorId: req.usuario.id,
    });

    return res.status(201).json(horario);
  } catch (error) {
    console.error("Error al crear horario:", error);

    const esErrorValidacion =
      error.message.includes("fecha") ||
      error.message.includes("turno") ||
      error.message.includes("obligatorios");

    return res.status(esErrorValidacion ? 400 : 500).json({
      mensaje: esErrorValidacion
        ? error.message
        : "No se pudo crear el horario.",
    });
  }
}
