import * as reportesService from './reportes.service.js';
import { registrarBitacora } from '../bitacora/bitacora.service.js';

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
    const nuevoReporte = await reportesService.crearReporte({
      ...req.body,
      emisorId: req.usuario.id,
    });

    await registrarBitacora({
      usuarioId: req.usuario.id,
      accion: 'INSERT',
      tablaAfectada: 'ReporteIncidencia',
      idRegistro: nuevoReporte.id,
      descripcion: `Reporte ${nuevoReporte.gravedad} para ${nuevoReporte.empleado}`,
      ipOrigen: req.ip,
    });

    res.status(201).json(nuevoReporte);
  } catch (error) {
    if (error.message === 'EMPLEADO_NO_EXISTE') {
      return res.status(400).json({ mensaje: 'El empleado seleccionado no existe' });
    }
    if (error.message === 'LIMITE_LLAMADOS') {
      return res.status(409).json({ mensaje: 'El empleado ya tiene 4 llamados de atención (RN-012)' });
    }
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear el reporte' });
  }
};

export const deleteReporte = async (req, res) => {
  try {
    const { id } = req.params;
    await reportesService.eliminarReporte(id);

    await registrarBitacora({
      usuarioId: req.usuario.id,
      accion: 'DELETE',
      tablaAfectada: 'ReporteIncidencia',
      idRegistro: Number(id),
      descripcion: 'Reporte eliminado',
      ipOrigen: req.ip,
    });

    res.json({ mensaje: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el reporte' });
  }
};