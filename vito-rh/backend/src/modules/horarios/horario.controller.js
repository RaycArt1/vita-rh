
import * as horarioService from "./horario.service.js";
import * as generadorService from "./generador.service.js";

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



export async function cambiarAsignacion(req, res) {
  try {
    const resultado = await horarioService.cambiarAsignacion({
      ...req.body,
      creadoPorId: req.usuario.id,
    });

    return res.json(resultado);
  } catch (error) {
    console.error("Error al cambiar asignación:", error);

    const esValidacion =
      error.message.includes("fecha") ||
      error.message.includes("turno") ||
      error.message.includes("asignación") ||
      error.message.includes("empleado") ||
      error.message.includes("administrador");

    return res.status(esValidacion ? 400 : 500).json({
      mensaje: esValidacion
        ? error.message
        : "No se pudo cambiar la asignación.",
    });
  }
}


export async function generarVistaPrevia(req, res) {
  try {
    const resultado = await generadorService.generarVistaPrevia({
      mes: req.body.mes,
      modo: req.body.modo,
    });

    return res.json(resultado);
  } catch (error) {
    console.error("Error al generar horarios:", error);

    return res.status(400).json({
      mensaje: error.message || "No se pudo generar la planificación.",
    });
  }
}

export async function guardarPlanificacion(req, res) {
  try {
    const resultado = await horarioService.guardarPlanificacion({
      mes: req.body.mes,
      modo: req.body.modo,
      creadoPorId: req.usuario.id,
    });

    return res.json(resultado);
  } catch (error) {
    console.error("Error al guardar planificación:", error);

    const esValidacion =
      error.message.includes("mes") ||
      error.message.includes("modo") ||
      error.message.includes("conflictos") ||
      error.message.includes("asignar") ||
      error.message.includes("administrador") ||
      error.message.includes("empleado") ||
      error.message.includes("asignación") ||
      error.message.includes("activo");

    return res.status(esValidacion ? 400 : 500).json({
      mensaje: error.message || "No se pudo guardar la planificación.",
    });
  }
}