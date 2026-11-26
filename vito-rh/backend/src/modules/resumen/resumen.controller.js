import * as resumenService from "./resumen.service.js";
import { registrarBitacora } from "../bitacora/bitacora.service.js";

export async function resumenDelEmpleado(req, res) {
  try {
    const empleadoId = req.usuario?.empleadoId;
    if (!empleadoId) {
      return res.status(403).json({ mensaje: "Tu usuario no está asociado a un empleado" });
    }
    res.json(await resumenService.resumenEmpleado(empleadoId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function llamadosDelEmpleado(req, res) {
  try {
    const empleadoId = req.usuario?.empleadoId;
    if (!empleadoId) {
      return res.status(403).json({ mensaje: "Tu usuario no está asociado a un empleado" });
    }
    res.json(await resumenService.llamadosDeEmpleado(empleadoId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function perfilDelEmpleado(req, res) {
  try {
    const empleadoId = req.usuario?.empleadoId;
    if (!empleadoId) {
      return res.status(403).json({ mensaje: "Tu usuario no está asociado a un empleado" });
    }
    const perfil = await resumenService.perfilEmpleado(empleadoId);
    if (!perfil) {
      return res.status(404).json({ mensaje: "Empleado no encontrado" });
    }
    res.json(perfil);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function firmarLlamadoEmpleado(req, res) {
  try {
    const empleadoId = req.usuario?.empleadoId;
    const llamadoId = Number(req.params.id);
    if (!empleadoId) {
      return res.status(403).json({ mensaje: "Tu usuario no está asociado a un empleado" });
    }
    if (!Number.isInteger(llamadoId) || llamadoId <= 0) {
      return res.status(400).json({ mensaje: "Id de llamado no válido" });
    }

    const resultado = await resumenService.firmarLlamado(llamadoId, empleadoId);
    if (resultado?.error === "NO_ENCONTRADO") {
      return res.status(404).json({ mensaje: "Llamado no encontrado" });
    }
    if (resultado?.error === "YA_FIRMADO") {
      return res.status(409).json({ mensaje: "Este llamado ya fue firmado" });
    }

    await registrarBitacora({
      usuarioId: req.usuario.id,
      accion: "UPDATE",
      tablaAfectada: "LlamadoAtencion",
      idRegistro: llamadoId,
      descripcion: "Llamado firmado por el empleado",
      ipOrigen: req.ip,
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function cambiarPassword(req, res) {
  try {
    const { actual, nueva } = req.body;
    if (!actual || !nueva) {
      return res.status(400).json({ mensaje: "Debes indicar la contraseña actual y la nueva." });
    }
    const r = await resumenService.cambiarPasswordPropia(req.usuario.id, String(actual), String(nueva));
    if (r.error === "ACTUAL_INCORRECTA") {
      return res.status(400).json({ mensaje: "La contraseña actual no es correcta." });
    }
    res.json({ mensaje: "Contraseña actualizada." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}