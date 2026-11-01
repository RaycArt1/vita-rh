import { Router } from "express";
import { obtenerAreas, crearArea, crearPuesto } from "./mantenimiento.controller.js";

const router = Router();

router.get("/areas", obtenerAreas);
router.post("/areas", crearArea);
router.post("/puestos", crearPuesto);

export default router; // <--- Esta línea es la que falta o está diferente