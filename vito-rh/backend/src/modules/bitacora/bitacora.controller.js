import * as bitacoraService from "./bitacora.service.js";

export async function listarBitacora(req, res) {
  try {
    if (req.usuario?.rol !== "ADMINISTRADOR") {
      return res.status(403).json({ mensaje: "Solo el administrador puede consultar la bitácora" });
    }

    const { desde, hasta, usuarioId, accion, tabla, pagina, porPagina } = req.query;

    const resultado = await bitacoraService.listarBitacora({
      desde,
      hasta,
      usuarioId: usuarioId ? Number(usuarioId) : undefined,
      accion,
      tabla,
      pagina: Math.max(1, Number(pagina) || 1),
      porPagina: Math.min(100, Math.max(1, Number(porPagina) || 20)),
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}