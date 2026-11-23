
import { Router } from "express";
import * as horarioController from "./horario.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, horarioController.obtenerHorarios);
router.post("/", verificarToken, horarioController.crearHorario);
router.put("/asignacion", verificarToken, horarioController.cambiarAsignacion);
router.post("/generar",verificarToken,horarioController.generarVistaPrevia);
router.post("/guardar",verificarToken,horarioController.guardarPlanificacion);

export default router;