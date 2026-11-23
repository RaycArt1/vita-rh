import { Router } from "express";
import {
  listarRoles,
  crearRol,
  obtenerPermisosRol,
  guardarPermisosRol
} from "./roles.controller.js";
const router = Router();
router.get("/", listarRoles);
router.post("/", crearRol);
// 👇 AGREGA ESTAS DOS LÍNEAS SI FALTABAN EN TU ROUTER
router.get("/:id/permisos", obtenerPermisosRol);
router.put("/:id/permisos", guardarPermisosRol);

export default router;
