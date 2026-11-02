
import prisma from "../../config/prisma.js";

function obtenerFechaDia(valor) {
  if (!valor) {
    throw new Error("La fecha es obligatoria.");
  }

  // Normalizamos el día a medianoche UTC para evitar duplicados
  // provocados por diferencias de hora.
  const fechaTexto = String(valor).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTexto)) {
    throw new Error("La fecha debe tener el formato YYYY-MM-DD.");
  }

  const fecha = new Date(`${fechaTexto}T00:00:00.000Z`);

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== fechaTexto
  ) {
    throw new Error("La fecha no es válida.");
  }

  return fecha;
}

export async function obtenerDescansos(fechaInicio, fechaFin) {
  const inicio = obtenerFechaDia(fechaInicio);
  const fin = obtenerFechaDia(fechaFin);

  if (fin < inicio) {
    throw new Error("La fecha final no puede ser anterior a la inicial.");
  }

  return prisma.descanso.findMany({
    where: {
      fecha: {
        gte: inicio,
        lte: fin,
      },
    },
    include: {
      empleado: true,
      creadoPor: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: [{ fecha: "asc" }, { empleadoId: "asc" }],
  });
}

export async function asignarDescanso(data) {
  const empleadoId = Number(data.empleadoId);
  const creadoPorId = Number(data.creadoPorId);
  const fecha = obtenerFechaDia(data.fecha);

  if (
    !Number.isInteger(empleadoId) ||
    empleadoId <= 0 ||
    !Number.isInteger(creadoPorId) ||
    creadoPorId <= 0
  ) {
    throw new Error("El empleado y el usuario administrador son obligatorios.");
  }

  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: { id: true, estado: true },
  });

  if (!empleado || empleado.estado !== "ACTIVO") {
    throw new Error("El empleado no existe o está inactivo.");
  }

  return prisma.descanso.upsert({
    where: {
      empleadoId_fecha: {
        empleadoId,
        fecha,
      },
    },
    update: {
      creadoPorId,
    },
    create: {
      empleadoId,
      creadoPorId,
      fecha,
    },
    include: {
      empleado: true,
    },
  });
}

export async function quitarDescanso(data) {
  const empleadoId = Number(data.empleadoId);
  const fecha = obtenerFechaDia(data.fecha);

  if (!Number.isInteger(empleadoId) || empleadoId <= 0) {
    throw new Error("El empleado indicado no es válido.");
  }

  return prisma.descanso.delete({
    where: {
      empleadoId_fecha: {
        empleadoId,
        fecha,
      },
    },
  });
}
