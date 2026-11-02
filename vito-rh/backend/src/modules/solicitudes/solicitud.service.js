import prisma from "../../config/prisma.js";

const UNA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

export async function obtenerSolicitudes() {
  return prisma.solicitud.findMany({
    include: {
      empleado: { include: { puesto: { include: { area: true } } } },
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

export async function obtenerSolicitudPorId(id) {
  return prisma.solicitud.findUnique({
    where: { id },
    include: {
      empleado: { include: { puesto: { include: { area: true } } } },
    },
  });
}

// RN-008: la solicitud debe hacerse con al menos una semana de anticipación
export function cumpleAnticipacion(fechaInicio) {
  return new Date(fechaInicio).getTime() - Date.now() >= UNA_SEMANA_MS;
}

// RN-009: no pueden coincidir dos empleados de la misma área en vacaciones
export async function hayConflictoDeArea(areaId, fechaInicio, fechaFin, excluirId = null) {
  const conflicto = await prisma.solicitud.findFirst({
    where: {
      id: excluirId ? { not: excluirId } : undefined,
      estado: "APROBADA",
      tipoSolicitud: "VACACION",
      fechaInicio: { lte: new Date(fechaFin) },
      fechaFin: { gte: new Date(fechaInicio) },
      empleado: { areaId },
    },
    select: { id: true },
  });

  return Boolean(conflicto);
}

export async function crearSolicitud(datos) {
  return prisma.solicitud.create({
    data: datos,
    include: {
      empleado: { include: { puesto: { include: { area: true } } } },
    },
  });
}

export async function cambiarEstadoSolicitud(id, datos) {
  return prisma.solicitud.update({
    where: { id },
    data: datos,
    include: {
      empleado: { include: { puesto: { include: { area: true } } } },
    },
  });
}

export async function obtenerEmpleadoConArea(empleadoId) {
  return prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: { id: true, areaId: true },
  });
}

export async function actualizarSolicitud(id, datos) {
  return prisma.solicitud.update({
    where: { id },
    data: datos,
    include: {
      empleado: { include: { puesto: { include: { area: true } } } },
    },
  });
}
