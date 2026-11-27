import prisma from '../../config/prisma.js';

export const obtenerReportes = async () => {
  return await prisma.reporteIncidencia.findMany({
    orderBy: { id: 'desc' },
    include: {
      llamado: {
        select: { decision: true, observacionEmpleado: true, fechaFirma: true },
      },
    },
  });
};

export const crearReporte = async (datos) => {
  const empleadoId = Number(datos.empleadoId);
  const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
  if (!empleado) throw new Error("EMPLEADO_NO_EXISTE");

  const llamadosPrevios = await prisma.llamadoAtencion.count({ where: { empleadoId } });
  if (llamadosPrevios >= 4) throw new Error("LIMITE_LLAMADOS");

  return prisma.$transaction(async (tx) => {
    const reporte = await tx.reporteIncidencia.create({
      data: {
        empleado: `${empleado.nombres} ${empleado.apellidos}`,
        tipo: datos.tipo,
        gravedad: datos.gravedad,
        supervisor: datos.supervisor,
        fecha: datos.fecha,
        descripcion: datos.descripcion,
        seguimiento: datos.seguimiento ?? null,
        documentoUrl: datos.documentoUrl ?? null,
        empleadoId,
      },
    });

    await tx.llamadoAtencion.create({
      data: {
        descripcionFalta: datos.descripcion,
        tipoFalta: datos.gravedad,
        fecha: new Date(datos.fecha),
        numeroLlamado: llamadosPrevios + 1,
        empleadoId,
        emisorId: datos.emisorId,
        reporteId: reporte.id,
      },
    });

    return reporte;
  });
};

// NUEVA FUNCIÓN PARA ELIMINAR EN EL SERVICIO
export const eliminarReporte = async (id) => {
  return await prisma.reporteIncidencia.delete({
    where: { id: Number(id) },
  });
};