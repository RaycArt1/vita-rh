
import * as descansoService from "./descanso.service.js";

export async function obtenerDescansos(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        mensaje: "fechaInicio y fechaFin son obligatorias.",
      });
    }

    const descansos = await descansoService.obtenerDescansos(
      fechaInicio,
      fechaFin
    );

    return res.json(descansos);
  } catch (error) {
    console.error("Error al obtener descansos:", error);

    return res.status(400).json({
      mensaje: error.message || "No se pudieron obtener los descansos.",
    });
  }
}

export async function asignarDescanso(req, res) {
  try {
    const descanso = await descansoService.asignarDescanso({
      ...req.body,
      creadoPorId: req.usuario.id,
    });

    return res.status(201).json(descanso);
  } catch (error) {
    console.error("Error al asignar descanso:", error);

    const mensaje = error.message || "No se pudo asignar el descanso.";
    const estado = mensaje.includes("obligatorios") ||
      mensaje.includes("válida") ||
      mensaje.includes("formato") ||
      mensaje.includes("inactivo") ||
      mensaje.includes("anterior")
      ? 400
      : 500;

    return res.status(estado).json({ mensaje });
  }
}

export async function quitarDescanso(req, res) {
  try {
    await descansoService.quitarDescanso(req.body);

    return res.json({
      mensaje: "Descanso eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error al quitar descanso:", error);

    return res.status(400).json({
      mensaje: error.message || "No se pudo quitar el descanso.",
    });
  }
}
