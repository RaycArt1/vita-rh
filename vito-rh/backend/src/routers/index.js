import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import empleadoRoutes from "../modules/empleados/empleado.routes.js";
import horariosRoutes from "../modules/horarios/horario.routes.js";
import descansosRoutes from "../modules/horarios/descanso.routes.js";
import usuariosRoutes from "../modules/usuarios/usuarios.routes.js";
import rolesRoutes from "../modules/roles/roles.routes.js";
import mantenimientoRoutes from "../modules/mantenimiento/mantenimiento.routes.js";
import reportesRoutes from "../modules/reportes/reportes.routes.js";
import reclutamientoRoutes from "../modules/reclutamiento/reclutamiento.routes.js";
import solicitudRoutes from "../modules/solicitudes/solicitud.routes.js";
import bitacoraRoutes from "../modules/bitacora/bitacora.routes.js";

const router = Router();

router.use("/descansos", descansosRoutes);
router.use("/horarios", horariosRoutes);
router.use("/auth", authRoutes);
router.use("/empleados", empleadoRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/roles", rolesRoutes);
router.use("/mantenimiento", mantenimientoRoutes);
router.use("/reportes", reportesRoutes);
router.use("/reclutamiento", reclutamientoRoutes);
router.use("/solicitudes", solicitudRoutes);
router.use("/bitacora", bitacoraRoutes);

router.get("/", (req, res) => {
  res.json({
    sistema: "Vito RH",
    version: "1.0.0",
    estado: "API funcionando",
  });
});

export default router;