
import prisma from "../../config/prisma.js";

const incluirPuesto = {
  puesto: {
    include: {
      area: true,
    },
  },
};

export async function obtenerEmpleados() {
  return prisma.empleado.findMany({
    include: incluirPuesto,
    orderBy: { id: "asc" },
  });
}

export async function obtenerEmpleadoPorId(id) {
  return prisma.empleado.findUnique({
    where: { id },
    include: incluirPuesto,
  });
}


export async function existePuesto(puestoId) {
  const puesto = await prisma.puesto.findUnique({
    where: { id: puestoId },
    select: { id: true },
  });

  return Boolean(puesto);
}


export async function obtenerAreas() {
  return prisma.area.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function obtenerPuestos() {
  return prisma.puesto.findMany({
    include: { area: true },
    orderBy: { nombre: "asc" },
  });
}

export async function existeArea(areaId) {
  return Boolean(
    await prisma.area.findUnique({ where: { id: areaId } })
  );
}

export async function obtenerPuestoPorId(puestoId) {
  return prisma.puesto.findUnique({
    where: { id: puestoId },
    include: { area: true },
  });
}

export async function crearEmpleado(datos) {
  return prisma.empleado.create({
    data: datos,
    include: incluirPuesto,
  });
}

export async function actualizarEmpleado(id, datos) {
  return prisma.empleado.update({
    where: { id },
    data: datos,
    include: incluirPuesto,
  });
}

export async function desactivarEmpleado(id, motivoBaja) {
  return prisma.empleado.update({
    where: { id },
    data: {
      estado: "INACTIVO",
      fechaBaja: new Date(),
      ...(motivoBaja ? { motivoBaja } : {}),
    },
    include: incluirPuesto,
  });
}
