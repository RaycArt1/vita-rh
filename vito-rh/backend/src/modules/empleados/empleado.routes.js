import { Router } from "express";
import * as empleadoController from "./empleado.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";

const router = Router();

router.get("/catalogos/areas", verificarToken, empleadoController.obtenerAreas);
router.get("/catalogos/puestos", verificarToken, empleadoController.obtenerPuestos);

router.get("/", verificarToken, empleadoController.obtenerEmpleados);
router.get("/:id", verificarToken, empleadoController.obtenerEmpleado);
router.post("/", verificarToken, empleadoController.crearEmpleado);
router.put("/:id", verificarToken, empleadoController.actualizarEmpleado);
router.patch("/:id/desactivar", verificarToken, empleadoController.desactivarEmpleado);

export default router;