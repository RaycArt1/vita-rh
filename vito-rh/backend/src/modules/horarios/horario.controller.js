
import * as horarioService from "./horario.service.js";
import * as generadorService from "./generador.service.js";

function obtenerMensajeError(error) {
  return String(error?.message ?? "");
}

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

    const mensaje = obtenerMensajeError(error).toLowerCase();

    const esErrorValidacion =
      mensaje.includes("fecha") ||
      mensaje.includes("turno") ||
      mensaje.includes("obligatorios");

    return res.status(esErrorValidacion ? 400 : 500).json({
      mensaje: esErrorValidacion
        ? obtenerMensajeError(error)
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

    const mensajeOriginal = obtenerMensajeError(error);
    const mensaje = mensajeOriginal.toLowerCase();

    const esValidacion =
      mensaje.includes("fecha") ||
      mensaje.includes("turno") ||
      mensaje.includes("asignación") ||
      mensaje.includes("empleado") ||
      mensaje.includes("administrador") ||
      mensaje.includes("descanso") ||
      mensaje.includes("área") ||
      mensaje.includes("area") ||
      mensaje.includes("viernes") ||
      mensaje.includes("sábado") ||
      mensaje.includes("sabado") ||
      mensaje.includes("domingo");

    return res.status(esValidacion ? 400 : 500).json({
      mensaje: esValidacion
        ? mensajeOriginal
        : "No se pudo cambiar la asignación debido a un error interno.",
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
      mensaje:
        obtenerMensajeError(error) ||
        "No se pudo generar la planificación.",
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

    const mensajeOriginal = obtenerMensajeError(error);
    const mensaje = mensajeOriginal.toLowerCase();

    const esValidacion =
      mensaje.includes("mes") ||
      mensaje.includes("modo") ||
      mensaje.includes("conflictos") ||
      mensaje.includes("asignar") ||
      mensaje.includes("administrador") ||
      mensaje.includes("empleado") ||
      mensaje.includes("asignación") ||
      mensaje.includes("activo") ||
      mensaje.includes("descanso") ||
      mensaje.includes("área") ||
      mensaje.includes("area");

    return res.status(esValidacion ? 400 : 500).json({
      mensaje: mensajeOriginal || "No se pudo guardar la planificación.",
    });
  }
}
