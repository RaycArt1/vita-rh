import { Router } from "express";
import * as empleadoController from "./empleado.controller.js";

const router = Router();

router.get("/", empleadoController.obtenerEmpleados);

export default router;