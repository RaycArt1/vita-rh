import prisma from "../../config/prisma.js";

export async function obtenerEmpleados() {
  return await prisma.empleado.findMany({
    include: {
      puesto: {
        include: {
          area: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}