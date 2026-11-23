
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Directorio absoluto del backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

const cvDir = path.join(uploadsDir, "cvs");
const fotoDir = path.join(uploadsDir, "fotos");

// Crear las carpetas si no existen
fs.mkdirSync(cvDir, { recursive: true });
fs.mkdirSync(fotoDir, { recursive: true });

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "foto") {
      return cb(null, fotoDir);
    }

    cb(null, cvDir);
  },

  filename: (req, file, cb) => {
    const nombre = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname).toLowerCase()}`;

    cb(null, nombre);
  },
});

export const subirCV = multer({
  storage: almacenamiento,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === "foto") {
      const esJPG =
        [".jpg", ".jpeg"].includes(extension) &&
        file.mimetype === "image/jpeg";

      const esPNG =
        extension === ".png" &&
        file.mimetype === "image/png";

      if (!esJPG && !esPNG) {
        return cb(new Error("La fotografía debe ser JPG o PNG."));
      }

      return cb(null, true);
    }

    const extensiones = [".pdf", ".doc", ".docx"];

    if (!extensiones.includes(extension)) {
      return cb(new Error("Solo se permiten archivos PDF, DOC y DOCX"));
    }

    cb(null, true);
  },
});
