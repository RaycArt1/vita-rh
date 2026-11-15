import { Router } from 'express';
import { getReportes, createReporte, deleteReporte } from './reportes.controller.js';
import { verificarToken } from '../auth/auth.middleware.js';

const router = Router();

router.get('/', verificarToken, getReportes);
router.post('/', verificarToken, createReporte);
router.delete('/:id', verificarToken, deleteReporte);

export default router;