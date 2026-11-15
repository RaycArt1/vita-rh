
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const carpetaEntrevistas = path.resolve(
  process.cwd(),
  "uploads",
  "entrevistas"
);

fs.mkdirSync(carpetaEntrevistas, { recursive: true });

const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carpetaEntrevistas);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    cb(null, `${randomUUID()}${extension}`);
  },
});

export const subirDocumentoEntrevista = multer({
  storage: almacenamiento,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const formatosPermitidos = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };

    if (formatosPermitidos[extension] !== file.mimetype) {
      return cb(
        new Error("Solo se permiten archivos PDF, JPG y PNG.")
      );
    }

    cb(null, true);
  },
});
