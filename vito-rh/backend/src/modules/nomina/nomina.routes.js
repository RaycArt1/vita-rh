import { Router } from 'express';
import {
  obtenerPlanillas,
  crearPlanilla,
  actualizarDetalle,
  cambiarEstadoDetalle,
  procesarTodos
} from './nomina.controller.js';




const router = Router();




router.get('/', obtenerPlanillas);
router.post('/', crearPlanilla);
router.put('/detalles/:id', actualizarDetalle);
router.patch('/detalles/:id/estado', cambiarEstadoDetalle);
router.post('/:planillaId/procesar-todos', procesarTodos);




export default router; // <-- ASEGÚRATE QUE SEA ASÍ
