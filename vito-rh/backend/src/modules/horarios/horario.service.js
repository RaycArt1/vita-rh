
import prisma from "../../config/prisma.js";

const TURNOS_VALIDOS = ["T12_20", "T12_22"];

function obtenerFechaValida(valor, campo) {
  const fecha = new Date(valor);

  if (!valor || Number.isNaN(fecha.getTime())) {
    throw new Error(`${campo} no es una fecha válida.`);
  }

  return fecha;
}

export async function obtenerHorarios() {
  return prisma.horario.findMany({
    include: {
      empleado: true,
      area: true,
      creadoPor: true,
    },
    orderBy: {
      fechaInicio: "asc",
    },
  });
}

export async function crearHorario(data) {
  const fechaInicio = obtenerFechaValida(data.fechaInicio, "fechaInicio");
  const fechaFin = obtenerFechaValida(data.fechaFin, "fechaFin");

  if (fechaFin < fechaInicio) {
    throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");
  }

  if (!TURNOS_VALIDOS.includes(data.turno)) {
    throw new Error("El turno debe ser T12_20 o T12_22.");
  }

  const empleadoId = Number(data.empleadoId);
  const areaId = Number(data.areaId);
  const creadoPorId = Number(data.creadoPorId);

  if (
    !Number.isInteger(empleadoId) ||
    !Number.isInteger(areaId) ||
    !Number.isInteger(creadoPorId)
  ) {
    throw new Error("empleadoId, areaId y creadoPorId son obligatorios y deben ser números enteros.");
  }

  return prisma.horario.create({
    data: {
      fechaInicio,
      fechaFin,
      turno: data.turno,
      empleadoId,
      areaId,
      creadoPorId,
    },
    include: {
      empleado: true,
      area: true,
      creadoPor: true,
    },
  });
}
