import * as dashboardService from "./dashboard.service.js";

export async function obtenerDashboard(req, res) {
  try {
    const resumen = await dashboardService.obtenerResumenDashboard();
    return res.json(resumen);
  } catch (error) {
    console.error("Error al obtener dashboard:", error);

    return res.status(500).json({
      mensaje: "No se pudo cargar la información del dashboard.",
    });
  }
}
