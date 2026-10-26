import { Router } from "express";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/login", authController.login);
router.post("/recuperar", authController.solicitarRecuperacion);
router.post("/restablecer", authController.restablecerContrasena);

export default router;