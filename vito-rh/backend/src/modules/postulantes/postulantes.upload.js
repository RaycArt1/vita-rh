import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

const carpeta = path.resolve(process.cwd(), "uploads", "fotos-postulantes");
fs.mkdirSync(carpeta, { recursive: true });

export const subirFotoPostulante = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, carpeta),
    filename: (_req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const tipos = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, tipos[ext] === file.mimetype);
  },
});
