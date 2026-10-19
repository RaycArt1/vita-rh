
import { Router } from "express";
import * as empleadoController from "./empleado.controller.js";

const router = Router();

router.get("/catalogos/areas", empleadoController.obtenerAreas);
router.get("/catalogos/puestos", empleadoController.obtenerPuestos);

router.get("/", empleadoController.obtenerEmpleados);
router.get("/:id", empleadoController.obtenerEmpleado);
router.post("/", empleadoController.crearEmpleado);
router.put("/:id", empleadoController.actualizarEmpleado);
router.patch("/:id/desactivar", empleadoController.desactivarEmpleado);

export default router;
