import { Router } from "express";
import { verificarToken } from "../auth/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

router.get("/", verificarToken, dashboardController.obtenerDashboard);

export default router;
