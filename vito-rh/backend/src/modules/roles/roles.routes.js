import { Router } from "express";
import { listarRoles, crearRol } from "./roles.controller.js";

const router = Router();

router.get("/", listarRoles);
router.post("/", crearRol);

export default router;