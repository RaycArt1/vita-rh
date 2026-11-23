import { Router } from "express";
import { verificarToken, permitirRoles } from "../auth/auth.middleware.js";
import { subirCV } from "../../uploadCV.js";
import { subirFotoPostulante } from "./postulantes.upload.js";
import * as ctrl from "./postulantes.controller.js";

const router = Router();
const soloPostulante = [verificarToken, permitirRoles("POSTULANTE")];

router.post("/registro", ctrl.registrar);
router.get("/vacantes", ctrl.listarVacantesPublicas);
router.get("/me", ...soloPostulante, ctrl.obtenerMiPerfil);
router.put("/me", ...soloPostulante, subirFotoPostulante.single("foto"), ctrl.actualizarMiPerfil);
router.get("/me/foto", ...soloPostulante, ctrl.obtenerMiFoto);
router.post("/aplicar", ...soloPostulante, subirCV.single("cv"), ctrl.aplicar);
router.get("/mi-postulacion", ...soloPostulante, ctrl.miPostulacion);
router.patch("/mi-postulacion/oferta", ...soloPostulante, ctrl.responderMiOferta);

export default router;
