import { Router } from "express";
import * as usuariosController from "./usuarios.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";

const router = Router();

router.get("/empleados-disponibles", verificarToken, usuariosController.empleadosDisponibles);
router.get("/", verificarToken, usuariosController.listar);
router.post("/", verificarToken, usuariosController.crear);
router.put("/:id", verificarToken, usuariosController.actualizar);

export default router;