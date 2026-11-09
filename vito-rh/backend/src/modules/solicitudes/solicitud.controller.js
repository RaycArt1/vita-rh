import * as solicitudService from "./solicitud.service.js";
import { registrarBitacora } from "../bitacora/bitacora.service.js";

const TIPOS = ["VACACION", "PERMISO", "INCAPACIDAD"];

function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function errorServidor(res, error) {
  console.error(error);
  return res.status(500).json({ mensaje: "Error interno del servidor" });
}

export async function obtenerSolicitudes(req, res) {
  try {
    const solicitudes = await solicitudService.obtenerSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    errorServidor(res, error);
  }
}

export async function crearSolicitud(req, res) {
  try {
    const { empleadoId, tipoSolicitud, fechaInicio, fechaFin, motivo } = req.body;

    if (!empleadoId || !tipoSolicitud || !fechaInicio || !fechaFin) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    if (!TIPOS.includes(tipoSolicitud)) {
      return res.status(400).json({ mensaje: "tipoSolicitud debe ser VACACION, PERMISO o INCAPACIDAD" });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (isNaN(inicio) || isNaN(fin)) {
      return res.status(400).json({ mensaje: "Las fechas no son válidas" });
    }

    if (fin < inicio) {
      return res.status(400).json({ mensaje: "fechaFin no puede ser anterior a fechaInicio" });
    }

    const empleado = await solicitudService.obtenerEmpleadoConArea(Number(empleadoId));
    if (!empleado) {
      return res.status(400).json({ mensaje: "El empleado no existe" });
    }

    // RN-008: solo para vacaciones se exige la anticipación de una semana
    if (tipoSolicitud === "VACACION" && !solicitudService.cumpleAnticipacion(inicio)) {
      return res.status(400).json({ mensaje: "Las vacaciones deben solicitarse con al menos una semana de anticipación" });
    }

    // RN-009: no pueden coincidir dos empleados de la misma área en vacaciones
    if (tipoSolicitud === "VACACION") {
      const conflicto = await solicitudService.hayConflictoDeArea(empleado.areaId, inicio, fin);
      if (conflicto) {
        return res.status(409).json({ mensaje: "Ya hay un empleado de esta área de vacaciones en esas fechas" });
      }
    }

    const solicitud = await solicitudService.crearSolicitud({
      empleadoId: Number(empleadoId),
      tipoSolicitud,
      fechaInicio: inicio,
      fechaFin: fin,
      motivo: motivo ?? null,
      estado: "PENDIENTE",
    });

    await registrarBitacora({
      usuarioId: req.usuario.id,
      accion: "INSERT",
      tablaAfectada: "Solicitud",
      idRegistro: solicitud.id,
      descripcion: `Solicitud de ${tipoSolicitud.toLowerCase()} creada del ${inicio.toISOString().slice(0, 10)} al ${fin.toISOString().slice(0, 10)}`,
    ipOrigen: req.ip,
    });

res.status(201).json(solicitud);
  } catch (error) {
    errorServidor(res, error);
  }
}

export async function cambiarEstado(req, res) {
  try {
    const id = idValido(req.params.id);
    if (!id) {
      return res.status(400).json({ mensaje: "El id debe ser un número entero positivo" });
    }

    // RN-010: solo el administrador aprueba o rechaza
    if (req.usuario?.rol !== "ADMINISTRADOR") {
      return res.status(403).json({ mensaje: "Solo el administrador puede aprobar o rechazar solicitudes" });
    }

    const { estado, comentarioGerente } = req.body;
    if (!["APROBADA", "RECHAZADA"].includes(estado)) {
      return res.status(400).json({ mensaje: "estado debe ser APROBADA o RECHAZADA" });
    }

    const existente = await solicitudService.obtenerSolicitudPorId(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    if (estado === "APROBADA" && existente.tipoSolicitud === "VACACION") {
      const conflicto = await solicitudService.hayConflictoDeArea(
        existente.empleado.areaId,
        existente.fechaInicio,
        existente.fechaFin,
        id
      );
      if (conflicto) {
        return res.status(409).json({ mensaje: "No se puede aprobar: otro empleado del área ya tiene vacaciones en esas fechas" });
      }
    }

    const solicitud = await solicitudService.cambiarEstadoSolicitud(id, {
      estado,
      comentarioGerente: comentarioGerente ?? null,
      aprobadoPorId: req.usuario?.id ?? null,
    });
    
    await registrarBitacora({
    usuarioId: req.usuario.id,
    accion: "UPDATE",
    tablaAfectada: "Solicitud",
    idRegistro: id,
    descripcion: `Estado cambiado de ${existente.estado} a ${estado}`,
    ipOrigen: req.ip,
});
    res.json(solicitud);
  } catch (error) {
    errorServidor(res, error);
  }
}
export async function editarSolicitud(req, res) {
  try {
    const id = idValido(req.params.id);
    if (!id) {
      return res.status(400).json({ mensaje: "El id debe ser un número entero positivo" });
    }

    const existente = await solicitudService.obtenerSolicitudPorId(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    // Solo se edita si sigue pendiente
    if (existente.estado !== "PENDIENTE") {
      return res.status(409).json({ mensaje: "Solo se pueden editar solicitudes pendientes" });
    }

    // Solo el dueño o el administrador pueden editar
    const esDueno = req.usuario?.empleadoId === existente.empleadoId;
    const esAdmin = req.usuario?.rol === "ADMINISTRADOR";
    if (!esDueno && !esAdmin) {
      return res.status(403).json({ mensaje: "No puedes editar esta solicitud" });
    }

    const { tipoSolicitud, fechaInicio, fechaFin, motivo } = req.body;
    const tipo = tipoSolicitud ?? existente.tipoSolicitud;

    if (!TIPOS.includes(tipo)) {
      return res.status(400).json({ mensaje: "tipoSolicitud debe ser VACACION, PERMISO o INCAPACIDAD" });
    }

    const inicio = new Date(fechaInicio ?? existente.fechaInicio);
    const fin = new Date(fechaFin ?? existente.fechaFin);

    if (isNaN(inicio) || isNaN(fin)) {
      return res.status(400).json({ mensaje: "Las fechas no son válidas" });
    }

    if (fin < inicio) {
      return res.status(400).json({ mensaje: "fechaFin no puede ser anterior a fechaInicio" });
    }

    if (tipo === "VACACION") {
      if (!solicitudService.cumpleAnticipacion(inicio)) {
        return res.status(400).json({ mensaje: "Las vacaciones deben solicitarse con al menos una semana de anticipación" });
      }

      const area = existente.empleado.areaId;
      const conflicto = await solicitudService.hayConflictoDeArea(area, inicio, fin, id);
      if (conflicto) {
        return res.status(409).json({ mensaje: "Ya hay un empleado de esta área de vacaciones en esas fechas" });
      }
    }

    const cambios = [];
      if (tipo !== existente.tipoSolicitud) {
        cambios.push(`tipo de ${existente.tipoSolicitud.toLowerCase()} a ${tipo.toLowerCase()}`);
      }
      if (inicio.getTime() !== new Date(existente.fechaInicio).getTime() || fin.getTime() !== new Date(existente.fechaFin).getTime()) {
        cambios.push(`fechas de ${existente.fechaInicio.toISOString().slice(0, 10)} al ${existente.fechaFin.toISOString().slice(0, 10)} a ${inicio.toISOString().slice(0, 10)} al ${fin.toISOString().slice(0, 10)}`);
      }
      if ((motivo ?? existente.motivo ?? "") !== (existente.motivo ?? "")) {
        cambios.push("motivo actualizado");
      }

    const solicitud = await solicitudService.actualizarSolicitud(id, {
      tipoSolicitud: tipo,
      fechaInicio: inicio,
      fechaFin: fin,
      motivo: motivo ?? existente.motivo,
    });

    await registrarBitacora({
      usuarioId: req.usuario.id,
      accion: "UPDATE",
      tablaAfectada: "Solicitud",
      idRegistro: id,
     descripcion: cambios.join("; ") || "Sin cambios relevantes",
      ipOrigen: req.ip,
    });

    res.json(solicitud);
  } catch (error) {
    errorServidor(res, error);
  }
}