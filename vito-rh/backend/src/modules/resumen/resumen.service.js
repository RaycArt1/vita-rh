import prisma from "../../config/prisma.js";

export async function resumenEmpleado(empleadoId) {
  const hoy = new Date();

  const [solicitudes, proximoTurno, llamados] = await Promise.all([
    prisma.solicitud.findMany({
      where: { empleadoId },
      orderBy: { fechaSolicitud: "desc" },
      take: 5,
    }),
    prisma.horario.findFirst({
      where: { empleadoId, fechaInicio: { gte: hoy } },
      orderBy: { fechaInicio: "asc" },
    }),
    prisma.llamadoAtencion.count({ where: { empleadoId } }),
  ]);

  return {
    pendientes: solicitudes.filter((s) => s.estado === "PENDIENTE").length,
    aprobadas: solicitudes.filter((s) => s.estado === "APROBADA").length,
    rechazadas: solicitudes.filter((s) => s.estado === "RECHAZADA").length,
    ultimasSolicitudes: solicitudes,
    proximoTurno,
    llamados,
  };
}

export async function llamadosDeEmpleado(empleadoId) {
  return prisma.llamadoAtencion.findMany({
    where: { empleadoId },
    orderBy: { fecha: "desc" },
    include: {
      emisor: { select: { username: true } },
    },
  });
}

export async function perfilEmpleado(empleadoId) {
  return prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      identidad: true,
      telefono: true,
      correo: true,
      fechaIngreso: true,
      estado: true,
      salarioBase: true,
      puesto: { select: { nombre: true } },
      area: { select: { nombre: true } },
    },
  });
}

export async function responderLlamado(llamadoId, empleadoId, decision, observacion) {
  const llamado = await prisma.llamadoAtencion.findUnique({ where: { id: llamadoId } });
  if (!llamado || llamado.empleadoId !== empleadoId) return { error: "NO_ENCONTRADO" };
  if (llamado.decision) return { error: "YA_RESPONDIDO" };

  return prisma.llamadoAtencion.update({
    where: { id: llamadoId },
    data: {
      decision,
      firmadoEmpleado: decision === "ACEPTADO",
      observacionEmpleado: decision === "RECHAZADO" ? observacion : null,
      fechaFirma: new Date(),
    },
  });
}

import bcrypt from "bcrypt";

export async function cambiarPasswordPropia(usuarioId, actual, nueva) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) return { error: "NO_ENCONTRADO" };

  const coincide = await bcrypt.compare(actual, usuario.password);
  if (!coincide) return { error: "ACTUAL_INCORRECTA" };

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { password: await bcrypt.hash(nueva, 10) },
  });
  return { ok: true };
}