
import { Router } from "express";
import * as descansoController from "./descanso.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, descansoController.obtenerDescansos);
router.post("/", verificarToken, descansoController.asignarDescanso);
router.delete("/", verificarToken, descansoController.quitarDescanso);

export default router;
