import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routers/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});