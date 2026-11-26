import { Router } from "express";
import * as resumenController from "./resumen.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";
import { cambiarPassword } from "./resumen.controller.js";

const router = Router();

router.get("/empleado", verificarToken, resumenController.resumenDelEmpleado);
router.get("/llamados", verificarToken, resumenController.llamadosDelEmpleado);
router.get("/perfil", verificarToken, resumenController.perfilDelEmpleado);
router.patch("/llamados/:id/firmar", verificarToken, resumenController.firmarLlamadoEmpleado);
router.put("/password", verificarToken, cambiarPassword);

export default router;