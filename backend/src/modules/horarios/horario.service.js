import prisma from "../../config/prisma.js";

export async function obtenerHorarios() {
  return await prisma.horario.findMany({
    include: {
      empleado: true,
      turno: true,
    },
    orderBy: {
      fecha: "asc",
    },
  });
}

export async function crearHorario(data) {
  return await prisma.horario.create({
    data: {
      fecha: new Date(data.fecha),
      empleadoId: Number(data.empleadoId),
      turnoId: Number(data.turnoId),
    },
    include: {
      empleado: true,
      turno: true,
    },
  });
}