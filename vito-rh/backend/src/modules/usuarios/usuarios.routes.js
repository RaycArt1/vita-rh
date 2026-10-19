
import { Router } from "express";
import * as usuariosController from "./usuarios.controller.js";

const router = Router();

router.get("/empleados-disponibles", usuariosController.empleadosDisponibles);
router.get("/", usuariosController.listar);
router.post("/", usuariosController.crear);
router.put("/:id", usuariosController.actualizar);

export default router;
