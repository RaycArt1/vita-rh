import { Router } from "express";
import * as solicitudController from "./solicitud.controller.js";
import { verificarToken } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", verificarToken, solicitudController.obtenerSolicitudes);
router.post("/", verificarToken, solicitudController.crearSolicitud);
router.patch("/:id/estado", verificarToken, solicitudController.cambiarEstado);
router.put("/:id", verificarToken, solicitudController.editarSolicitud);

export default router;