
import multer from "multer";
import path from "path";

const almacenamiento = multer.diskStorage({
  
destination: (req, file, cb) => {
  if (file.fieldname === "foto") {
    return cb(null, "uploads/fotos");
  }

  cb(null, "uploads/cvs");
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



    if (!extensiones.includes(extension)) {
      return cb(new Error("Solo se permiten archivos PDF, DOC y DOCX"));
    }

    cb(null, true);
  },
});
