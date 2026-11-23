import { Router } from "express";
import { obtenerPermisosPorRol, guardarPermiso } from "./permisos.controller.js";




const router = Router();




router.get("/:roleId", obtenerPermisosPorRol);
router.post("/", guardarPermiso);




export default router;
