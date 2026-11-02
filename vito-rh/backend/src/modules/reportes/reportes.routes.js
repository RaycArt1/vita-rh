import { Router } from 'express';
import { getReportes, createReporte, deleteReporte } from './reportes.controller.js'; // Asegúrate de importar deleteReporte

const router = Router();

router.get('/', getReportes);
router.post('/', createReporte);
router.delete('/:id', deleteReporte); // <--- Agrega esta línea

export default router;