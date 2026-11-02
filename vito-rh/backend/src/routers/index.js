import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import empleadoRoutes from "../modules/empleados/empleado.routes.js";
import horariosRoutes from "../modules/horarios/horario.routes.js";
import usuariosRoutes from "../modules/usuarios/usuarios.routes.js";
import rolesRoutes from "../modules/roles/roles.routes.js";
import mantenimientoRoutes from "../modules/mantenimiento/mantenimiento.routes.js";
import reporteRoutes from "../modules/reportes/reportes.routes.js";
import descansoRoutes from "../modules/horarios/descanso.routes.js";
import mantenimientoRoutes from "../mantenimiento/mantenimiento.routes.js"; // <--- Nueva importación
import reclutamientoRoutes from "../modules/reclutamiento/reclutamiento.routes.js";

import reporteRoutes from "../modules/reportes/reportes.routes.js";

const router = Router();

import descansosRoutes from "../modules/horarios/descanso.routes.js";
import solicitudRoutes from "../modules/solicitudes/solicitud.routes.js";

const router = Router();

router.use("/descansos", descansosRoutes);
router.use("/horarios", horariosRoutes);
router.use("/auth", authRoutes);
router.use("/empleados", empleadoRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/roles", rolesRoutes);
router.use("/mantenimiento", mantenimientoRoutes);
router.use("/reportes", reporteRoutes);
router.use("/descansos", descansoRoutes);
router.use("/reclutamiento", reclutamientoRoutes);
router.use("/mantenimiento", mantenimientoRoutes); // <--- Nueva ruta agregada

router.use("/reportes", reporteRoutes); // <--- Montado correctamente bajo /api/reportes
router.use("/solicitudes", solicitudRoutes);

export default router;