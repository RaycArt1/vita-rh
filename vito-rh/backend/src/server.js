
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routers/index.js";
import reportesRoutes from "./modules/reportes/reportes.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.resolve(__dirname, "../../frontend/dist");

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/api/reportes", reportesRoutes);

// Servir el frontend de React
app.use(express.static(frontendPath));

// Cualquier otra ruta devuelve React
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Vito RH ejecutándose en http://localhost:${PORT}`);
});
