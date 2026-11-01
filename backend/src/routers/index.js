import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import empleadoRoutes from "../modules/empleados/empleado.routes.js";
import horarioRoutes from "../modules/horarios/horario.routes.js";


const router = Router();

router.use("/horarios", horarioRoutes);
router.use("/auth", authRoutes);
router.use("/empleados", empleadoRoutes);

router.get("/", (req, res) => {
  res.json({
    sistema: "Vito RH",
    version: "1.0.0",
    estado: "API funcionando",
  });
});

export default router;