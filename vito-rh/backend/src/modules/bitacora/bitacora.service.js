import prisma from "../../config/prisma.js";

export async function registrarBitacora({ usuarioId, accion, tablaAfectada, idRegistro, descripcion = null, ipOrigen = null }) {
  return prisma.bitacora.create({
    data: {
      usuarioId,
      accion,
      tablaAfectada,
      idRegistro,
      descripcion,
      ipOrigen,
    },
  });
}

export async function listarBitacora({ desde, hasta, usuarioId, accion, tabla, pagina = 1, porPagina = 20 }) {
  const where = {};
  if (desde || hasta) {
    where.fechaHora = {};
    if (desde) where.fechaHora.gte = new Date(desde);
    if (hasta) where.fechaHora.lte = new Date(hasta);
  }
  if (usuarioId) where.usuarioId = usuarioId;
  if (accion) where.accion = accion;
  if (tabla) where.tablaAfectada = tabla;

  const [registros, total] = await Promise.all([
    prisma.bitacora.findMany({
      where,
      orderBy: { fechaHora: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      include: { usuario: { select: { id: true, username: true } } },
    }),
    prisma.bitacora.count({ where }),
  ]);

  return { registros, total, pagina, porPagina };
}