import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import empleadoRoutes from "../modules/empleados/empleado.routes.js";
import horariosRoutes from "../modules/horarios/horario.routes.js"; // <--- Con la "s"
import usuariosRoutes from "../modules/usuarios/usuarios.routes.js";
import rolesRoutes from "../modules/roles/roles.routes.js";

const router = Router();

router.use("/horarios", horariosRoutes); // <--- Coincide exactamente
router.use("/auth", authRoutes);
router.use("/empleados", empleadoRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/roles", rolesRoutes);

router.get("/", (req, res) => {
    res.json({
        sistema: "Vito RH",
        version: "1.0.0",
        estado: "API funcionando",
    });
});

export default router;