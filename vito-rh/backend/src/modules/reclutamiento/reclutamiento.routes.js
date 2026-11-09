import { Router } from "express";
import { subirCV } from "../../uploadCV.js";
import { verificarToken } from "../auth/auth.middleware.js";
import {
  obtenerCandidatos,
  crearCandidato,
  actualizarCandidato,
  verCV,
  crearEntrevista,
} from "./reclutamiento.controller.js";
const router = Router();

router.get("/", verificarToken, obtenerCandidatos);
router.post("/", verificarToken, subirCV.single("cv"), crearCandidato);
router.put("/:id", verificarToken, actualizarCandidato);
router.get("/:id/cv", verificarToken, verCV);
router.post("/:id/entrevistas", verificarToken, crearEntrevista);

export default router;