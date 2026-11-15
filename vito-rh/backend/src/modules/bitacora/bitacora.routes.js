import { Router } from "express";
import * as bitacoraController from "./bitacora.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, bitacoraController.listarBitacora);

export default router;