
import multer from "multer";
import path from "path";
import fs from "node:fs";
const cvDir = path.resolve(process.cwd(), "uploads", "cvs");
fs.mkdirSync(cvDir, { recursive: true });

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvDir);
  },
  filename: (req, file, cb) => {
    const nombre = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, nombre);
  },
});

export const subirCV = multer({
  storage: almacenamiento,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extensiones = [".pdf", ".doc", ".docx"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!extensiones.includes(extension)) {
      return cb(new Error("Solo se permiten archivos PDF, DOC y DOCX"));
    }

    cb(null, true);
  },
});
