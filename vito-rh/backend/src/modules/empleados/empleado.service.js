import prisma from "../../config/prisma.js";

const incluirPuesto = {
  puesto: {
    include: {
      area: true,
    },
  },
};

export async function obtenerEmpleados() {
  return await prisma.empleado.findMany({
    include: incluirPuesto,
    orderBy: { id: "asc" },
  });
}

export async function obtenerEmpleadoPorId(id) {
  return await prisma.empleado.findUnique({
    where: { id },
    include: incluirPuesto,
  });
}

export async function crearEmpleado(datos) {
  return await prisma.empleado.create({
    data: datos,
  });
}

export async function actualizarEmpleado(id, datos) {
  return await prisma.empleado.update({
    where: { id },
    data: datos,
  });
}

export async function desactivarEmpleado(id) {
  return await prisma.empleado.update({
    where: { id },
    data: { estado: "INACTIVO" },
  });
}

export async function existePuesto(puestoId) {
  const puesto = await prisma.puesto.findUnique({
    where: { id: puestoId },
  });
  return puesto !== null;
}