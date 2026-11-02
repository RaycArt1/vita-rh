import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import routes from "./routers/index.js";
import reportesRoutes from "./modules/reportes/reportes.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales del sistema
app.use("/api", routes);

// Ruta directa para el módulo de reportes e incidencias
app.use("/api/reportes", reportesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});