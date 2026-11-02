import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const obtenerReportes = async () => {
  return await prisma.reporteIncidencia.findMany({
    orderBy: { id: 'desc' }
  });
};

export const crearReporte = async (datos) => {
  return await prisma.reporteIncidencia.create({
    data: datos
  });
};

// NUEVA FUNCIÓN PARA ELIMINAR EN EL SERVICIO
export const eliminarReporte = async (id) => {
  return await prisma.reporteIncidencia.delete({
    where: { id: Number(id) } // Asegura que el ID se pase como número para Prisma
  });
};

