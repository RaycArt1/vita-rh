import prisma from "../../config/prisma.js";
import path from "node:path";
import fs from "node:fs/promises";
import { Router } from "express";
import { subirCV } from "../../uploadCV.js";
import { obtenerVacantes, crearVacante } from "./vacantes.controller.js";
import { verificarToken, permitirRoles } from "../auth/auth.middleware.js";
import {
  obtenerCandidatos,
  crearCandidato,
  actualizarCandidato,
  verCV,
 crearEntrevista,
  actualizarEntrevista,
  cambiarEstadoEntrevista,
  guardarDocumentoEntrevista,
  verDocumentoEntrevista,
  guardarEvaluacion,
  guardarOferta,
  responderOferta,
  descartarCandidato,
  obtenerCatalogosContratacion,
  contratarCandidato
} from "./reclutamiento.controller.js";

import { subirDocumentoEntrevista } from "../../uploadEntrevista.js";


const router = Router();


router.get("/vacantes", verificarToken, permitirRoles("ADMINISTRADOR", "CHEF"), obtenerVacantes);
router.post("/vacantes", verificarToken, permitirRoles("ADMINISTRADOR"), crearVacante);

router.post("/", verificarToken, permitirRoles("ADMINISTRADOR"), subirCV.single("cv"), crearCandidato);
router.get("/", verificarToken, permitirRoles("ADMINISTRADOR"), obtenerCandidatos);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), actualizarCandidato);

router.get("/:id/cv", verificarToken, permitirRoles("ADMINISTRADOR"), verCV);

router.post("/:id/entrevistas", verificarToken, permitirRoles("ADMINISTRADOR"), crearEntrevista);



router.put(
  "/:id/entrevistas/:entrevistaId",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  actualizarEntrevista
);

router.patch(
  "/:id/entrevistas/:entrevistaId/estado",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  cambiarEstadoEntrevista
);


router.post(
  "/:id/entrevistas/:entrevistaId/documento",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  subirDocumentoEntrevista.single("documento"),
  guardarDocumentoEntrevista
);

router.get(
  "/:id/entrevistas/:entrevistaId/documento",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  verDocumentoEntrevista
);

router.put(
  "/:id/evaluacion",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  guardarEvaluacion
);


router.put(
  "/:id/oferta",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  guardarOferta
);

router.patch(
  "/:id/oferta/respuesta",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  responderOferta
);



router.patch(
  "/:id/descartar",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  descartarCandidato
);


router.get(
  "/catalogos-contratacion",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  obtenerCatalogosContratacion
);



router.post(
  "/:id/contratar",
  verificarToken,
  permitirRoles("ADMINISTRADOR"),
  contratarCandidato
);



// Acceso exclusivo de administradores a la fotografía del candidato.
router.get("/:id/fotografia-postulante", verificarToken, permitirRoles("ADMINISTRADOR"), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "Identificador de candidato inválido." });
  }
  try {
    const candidato = await prisma.candidato.findUnique({
      where: { id }, select: { fotoArchivo: true },
    });
    const nombre = candidato?.fotoArchivo;
    if (!nombre || path.basename(nombre) !== nombre || !/^[\w.-]+\.(?:jpe?g|png)$/i.test(nombre)) {
      return res.status(404).json({ mensaje: "Este candidato no tiene fotografía." });
    }
    const archivo = path.resolve(process.cwd(), "uploads", "fotos-postulantes", nombre);
    await fs.access(archivo);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.sendFile(archivo);
  } catch (error) {
    if (error.code === "ENOENT") return res.status(404).json({ mensaje: "No se encontró el archivo de fotografía." });
    console.error("Foto del candidato:", error);
    return res.status(500).json({ mensaje: "No se pudo mostrar la fotografía." });
  }
});

export default router;