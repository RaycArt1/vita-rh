import prisma from "../../config/prisma.js";
import path from "path";
import { fileURLToPath } from "url";


export const obtenerCandidatos = async (req, res) => {
  try {
    const candidatos = await prisma.candidato.findMany({
  orderBy: {
    fechaRegistro: "desc",
  },
  include: {
    entrevistas: {
      orderBy: {
        id: "desc",
      },
    },
  },
});

    res.json(candidatos);
  } catch (error) {
    console.error("Error al obtener candidatos:", error);

    res.status(500).json({
      mensaje: "Error al obtener los candidatos",
    });
  }
};
export const crearCandidato = async (req, res) => {
  try {
    const { nombre, apellido, telefono, email, puestoAplicado } = req.body;

    if (!nombre?.trim() || !apellido?.trim() || !puestoAplicado?.trim()) {
      return res.status(400).json({
        mensaje: "Nombre, apellido y puesto son obligatorios",
      });
    }

    const candidato = await prisma.candidato.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono?.trim() || null,
        email: email?.trim() || null,
        puestoAplicado: puestoAplicado.trim(),
        cvArchivo: req.file?.filename || null,
      },
    });

    res.status(201).json(candidato);
  } catch (error) {
    console.error("Error al crear candidato:", error);

    res.status(500).json({
      mensaje: "Error al registrar el candidato",
    });
  }
};

export const actualizarCandidato = async (req, res) => {
  try {
    const id = Number(req.params.id);
   const { estado, etapa } = req.body;


const estadosPermitidos = [
  "EN_PROCESO",
  "DESCARTADO",
  "CONTRATADO",
];

const etapasPermitidas = [
  "APLICACION",
  "REVISION_CV",
  "ENTREVISTA",
  "EVALUACION",
  "OFERTA",
  "CONTRATADO",
];

if (!Number.isInteger(id) || id <= 0) {
  return res.status(400).json({
    mensaje: "ID de candidato inválido",
  });
}

if (estado === undefined && etapa === undefined) {
  return res.status(400).json({
    mensaje: "Debes indicar un estado o una etapa",
  });
}

if (estado !== undefined && !estadosPermitidos.includes(estado)) {
  return res.status(400).json({
    mensaje: "Estado de candidato inválido",
  });
}

if (etapa !== undefined && !etapasPermitidas.includes(etapa)) {
  return res.status(400).json({
    mensaje: "Etapa de reclutamiento inválida",
  });
}

    const candidato = await prisma.candidato.update({
      where: { id },
      data: {
  ...(estado !== undefined ? { estado } : {}),
  ...(etapa !== undefined ? { etapa } : {}),
},
    });

    res.json(candidato);
  } catch (error) {
    console.error("Error al actualizar candidato:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        mensaje: "Candidato no encontrado",
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar el candidato",
    });
  }
};


export const verCV = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ mensaje: "ID inválido" });
    }

    const candidato = await prisma.candidato.findUnique({
      where: { id },
    });

    if (!candidato || !candidato.cvArchivo) {
      return res.status(404).json({ mensaje: "CV no encontrado" });
    }

    const nombreArchivo = path.basename(candidato.cvArchivo);
    const directorioActual = path.dirname(fileURLToPath(import.meta.url));

  const rutaArchivo = path.resolve(
  process.cwd(),
  "uploads",
  "cvs",
  nombreArchivo
);
    res.sendFile(rutaArchivo);
  } catch (error) {
    console.error("Error al consultar CV:", error);
    res.status(500).json({ mensaje: "Error al consultar el CV" });
  }
};

export const crearEntrevista = async (req, res) => {
  try {
    const candidatoId = Number(req.params.id);
    const entrevistadorId = req.usuario.id;
    const { fecha, fase, resultado, observaciones } = req.body;

    if (!Number.isInteger(candidatoId) || candidatoId <= 0 ||
        !fecha || !Number.isInteger(Number(fase)) ||
        Number(fase) < 1 || Number(fase) > 3) {
      return res.status(400).json({
        mensaje: "Verifica la fecha y la fase de la entrevista."
      });
    }

    const entrevista = await prisma.entrevista.create({
      data: {
        candidatoId,
        entrevistadorId,
        fecha: new Date(fecha),
        fase: Number(fase),
        resultado: resultado || "PENDIENTE",
        observaciones: observaciones || null
      }
    });

    res.status(201).json(entrevista);
  } catch (error) {
    console.error("Error al guardar entrevista:", error);
    res.status(500).json({
      mensaje: "No se pudo guardar la entrevista."
    });
  }
};