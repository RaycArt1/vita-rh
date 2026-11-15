import { Router } from "express";
import { listarRoles, crearRol } from "./roles.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, listarRoles);
router.post("/", verificarToken, crearRol);

export default router;