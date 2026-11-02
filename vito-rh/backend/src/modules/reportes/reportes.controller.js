import * as reportesService from './reportes.service.js';

export const getReportes = async (req, res) => {
  try {
    const data = await reportesService.obtenerReportes();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los reportes' });
  }
};

export const createReporte = async (req, res) => {
  try {
    const nuevoReporte = await reportesService.crearReporte(req.body);
    res.status(201).json(nuevoReporte);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el reporte' });
  }
};

// ¡Asegúrate de que tenga la palabra export aquí!
export const deleteReporte = async (req, res) => {
  try {
    const { id } = req.params;
    await reportesService.eliminarReporte(id);
    res.json({ mensaje: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el reporte' });
  }
};