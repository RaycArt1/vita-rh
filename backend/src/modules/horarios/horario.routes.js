import { Router } from "express";
import * as horarioController from "./horario.controller.js";

const router = Router();

router.get("/", horarioController.obtenerHorarios);
router.post("/", horarioController.crearHorario);

export default router;