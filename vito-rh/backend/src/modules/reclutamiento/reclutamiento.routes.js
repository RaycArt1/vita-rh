import { Router } from "express";
import { subirCV } from "../../uploadCV.js";
import { verificarToken, permitirRoles } from "../auth/auth.middleware.js";
import {
  obtenerCandidatos,
  crearCandidato,
  actualizarCandidato,
  verCV,
  verFoto,
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
import { obtenerVacantes, crearVacante } from "./vacantes.controller.js"


const router = Router();

// Vacantes (van antes de las rutas con :id)
router.get("/vacantes", verificarToken, permitirRoles("ADMINISTRADOR"), obtenerVacantes);
router.post("/vacantes", verificarToken, permitirRoles("ADMINISTRADOR"), crearVacante);


router.post(
  "/",
  subirCV.fields([
    { name: "cv", maxCount: 1 },
    { name: "foto", maxCount: 1 },
  ]),
  crearCandidato
);

router.get("/", verificarToken, permitirRoles("ADMINISTRADOR"), obtenerCandidatos);

router.put("/:id", verificarToken, permitirRoles("ADMINISTRADOR"), actualizarCandidato);

router.get("/:id/cv", verificarToken, permitirRoles("ADMINISTRADOR"), verCV);


router.get("/:id/foto", verificarToken, permitirRoles("ADMINISTRADOR"), verFoto);


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


export default router;