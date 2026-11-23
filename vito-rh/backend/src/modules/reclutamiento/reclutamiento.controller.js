import prisma from "../../config/prisma.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs/promises";

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
  evaluacion: true,
  oferta: true,
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

if (estado === "DESCARTADO") {
  return res.status(400).json({
    mensaje: "Para descartar un candidato debes registrar el motivo mediante la opción Descartar candidato.",
  });
}

if (estado === "CONTRATADO") {
  return res.status(400).json({
    mensaje: "Para contratar un candidato debes completar el registro de contratación.",
  });
}



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
    const {
  fecha,
  fase,
  resultado,
  observaciones,
  modalidad = "PRESENCIAL",
  indicaciones,
} = req.body;
    if (!Number.isInteger(candidatoId) || candidatoId <= 0 ||
        !fecha || !Number.isInteger(Number(fase)) ||
        Number(fase) < 1 || Number(fase) > 3) {
      return res.status(400).json({
        mensaje: "Verifica la fecha y la fase de la entrevista."
      });
    }

const modalidadesPermitidas = [
  "PRESENCIAL",
  "VIRTUAL",
  "TELEFONICA",
];

if (
  typeof modalidad !== "string" ||
  !modalidadesPermitidas.includes(modalidad)
) {
  return res.status(400).json({
    mensaje: "La modalidad de entrevista no es válida.",
  });
}

if (
  indicaciones != null &&
  typeof indicaciones !== "string"
) {
  return res.status(400).json({
    mensaje: "Las indicaciones deben ser texto.",
  });
}


const fechaHoraEntrevista = new Date(fecha);

if (
  Number.isNaN(fechaHoraEntrevista.getTime()) ||
  fechaHoraEntrevista.getTime() <= Date.now()
) {
  return res.status(400).json({
    mensaje: "La entrevista debe programarse para una fecha y hora futura.",
  });
}

if (
  typeof indicaciones !== "string" ||
  !indicaciones.trim()
) {
  return res.status(400).json({
    mensaje: "Debes ingresar las indicaciones de la entrevista.",
  });
}



    const entrevista = await prisma.entrevista.create({
      data: {
        candidatoId,
        entrevistadorId,
        fecha: new Date(fecha),
        fase: Number(fase),
        resultado: resultado || "PENDIENTE",
       observaciones: observaciones || null,
modalidad: modalidad,
indicaciones: indicaciones?.trim() || null
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


export const actualizarEntrevista = async (req, res) => {
  try {
    const candidatoId = Number(req.params.id);
    const entrevistaId = Number(req.params.entrevistaId);

    const {
      fecha,
      fase,
      resultado,
      observaciones,
      modalidad,
      indicaciones,
    } = req.body;

    if (
      !Number.isInteger(candidatoId) ||
      candidatoId <= 0 ||
      !Number.isInteger(entrevistaId) ||
      entrevistaId <= 0
    ) {
      return res.status(400).json({
        mensaje: "Identificador de entrevista inválido.",
      });
    }

    if (
      !fecha ||
      Number.isNaN(new Date(fecha).getTime()) ||
      !Number.isInteger(Number(fase)) ||
      Number(fase) < 1 ||
      Number(fase) > 3
    ) {
      return res.status(400).json({
        mensaje: "Verifica la fecha y la fase de la entrevista.",
      });
    }

    if (
      !["PRESENCIAL", "VIRTUAL", "TELEFONICA"].includes(modalidad) ||
      !["PENDIENTE", "APROBADO", "REPROBADO"].includes(resultado)
    ) {
      return res.status(400).json({
        mensaje: "Modalidad o resultado inválido.",
      });
    }

    if (
      (observaciones != null && typeof observaciones !== "string") ||
      (indicaciones != null && typeof indicaciones !== "string")
    ) {
      return res.status(400).json({
        mensaje: "Las observaciones e indicaciones deben ser texto.",
      });
    }

    const existente = await prisma.entrevista.findFirst({
      where: {
        id: entrevistaId,
        candidatoId,
      },
    });

    if (!existente) {
      return res.status(404).json({
        mensaje: "Entrevista no encontrada para este candidato.",
      });
    }


if (existente.estadoEntrevista !== "PENDIENTE") {
  return res.status(409).json({
    mensaje: "No puedes modificar una entrevista realizada o cancelada.",
  });
}

const nuevaFecha = new Date(fecha);

if (
  Number.isNaN(nuevaFecha.getTime()) ||
  nuevaFecha.getTime() <= Date.now()
) {
  return res.status(400).json({
    mensaje: "La entrevista debe tener una fecha y hora futura.",
  });
}

if (
  typeof indicaciones !== "string" ||
  !indicaciones.trim()
) {
  return res.status(400).json({
    mensaje: "Debes ingresar las indicaciones de la entrevista.",
  });
}




    const actualizada = await prisma.entrevista.update({
      where: { id: entrevistaId },
      data: {
        fecha: new Date(fecha),
        fase: Number(fase),
        resultado,
        modalidad,
        observaciones: observaciones?.trim() || null,
        indicaciones: indicaciones?.trim() || null,
      },
    });

    res.json(actualizada);
  } catch (error) {
    console.error("Error al actualizar entrevista:", error);

    res.status(500).json({
      mensaje: "No se pudo actualizar la entrevista.",
    });
  }
};



export const cambiarEstadoEntrevista = async (req, res) => {
  try {
    const candidatoId = Number(req.params.id);
    const entrevistaId = Number(req.params.entrevistaId);
    const { estadoEntrevista } = req.body;

    if (
      !Number.isInteger(candidatoId) ||
      candidatoId <= 0 ||
      !Number.isInteger(entrevistaId) ||
      entrevistaId <= 0
    ) {
      return res.status(400).json({
        mensaje: "Identificador inválido.",
      });
    }

    if (!["REALIZADA", "CANCELADA"].includes(estadoEntrevista)) {
      return res.status(400).json({
        mensaje: "Estado de entrevista no permitido.",
      });
    }

    const entrevista = await prisma.entrevista.findFirst({
      where: { id: entrevistaId, candidatoId },
    });

    if (!entrevista) {
      return res.status(404).json({
        mensaje: "Entrevista no encontrada.",
      });
    }

    if (entrevista.estadoEntrevista !== "PENDIENTE") {
      return res.status(409).json({
        mensaje: "Esta entrevista ya fue finalizada o cancelada.",
      });
    }



if (
  estadoEntrevista === "REALIZADA" &&
  new Date(entrevista.fecha).getTime() > Date.now()
) {
  return res.status(400).json({
    mensaje: "No puedes marcar como realizada una entrevista que todavía no ha ocurrido.",
  });
}



    const actualizada = await prisma.entrevista.update({
      where: { id: entrevistaId },
      data: { estadoEntrevista },
    });

    res.json(actualizada);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    res.status(500).json({
      mensaje: "No se pudo actualizar el estado.",
    });
  }
};



export const guardarDocumentoEntrevista = async (req, res) => {
  const eliminarArchivoSubido = async () => {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  };

  try {
    const candidatoId = Number(req.params.id);
    const entrevistaId = Number(req.params.entrevistaId);

    if (
      !Number.isInteger(candidatoId) ||
      candidatoId <= 0 ||
      !Number.isInteger(entrevistaId) ||
      entrevistaId <= 0
    ) {
      await eliminarArchivoSubido();
      return res.status(400).json({
        mensaje: "Identificador inválido.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        mensaje: "Debes seleccionar un documento.",
      });
    }

    const entrevista = await prisma.entrevista.findFirst({
      where: {
        id: entrevistaId,
        candidatoId,
      },
    });

    if (!entrevista) {
      await eliminarArchivoSubido();
      return res.status(404).json({
        mensaje: "Entrevista no encontrada.",
      });
    }

    if (entrevista.estadoEntrevista !== "PENDIENTE") {
      await eliminarArchivoSubido();
      return res.status(409).json({
        mensaje: "Solo puedes adjuntar documentos a entrevistas pendientes.",
      });
    }

    const actualizada = await prisma.entrevista.update({
      where: { id: entrevistaId },
      data: {
        documentoArchivo: req.file.filename,
      },
    });

    res.json({
      mensaje: "Documento guardado correctamente.",
      documentoArchivo: actualizada.documentoArchivo,
    });
  } catch (error) {
    await eliminarArchivoSubido();
    console.error("Error al guardar documento:", error);

    res.status(500).json({
      mensaje: "No se pudo guardar el documento.",
    });
  }
};



export const verDocumentoEntrevista = async (req, res) => {
  try {
    const candidatoId = Number(req.params.id);
    const entrevistaId = Number(req.params.entrevistaId);

    if (
      !Number.isInteger(candidatoId) ||
      candidatoId <= 0 ||
      !Number.isInteger(entrevistaId) ||
      entrevistaId <= 0
    ) {
      return res.status(400).json({
        mensaje: "Identificador inválido.",
      });
    }

    const entrevista = await prisma.entrevista.findFirst({
      where: {
        id: entrevistaId,
        candidatoId,
      },
    });

    if (!entrevista || !entrevista.documentoArchivo) {
      return res.status(404).json({
        mensaje: "Documento no encontrado.",
      });
    }

    const rutaArchivo = path.resolve(
      process.cwd(),
      "uploads",
      "entrevistas",
      path.basename(entrevista.documentoArchivo)
    );

    await fs.access(rutaArchivo);

    res.sendFile(rutaArchivo);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        mensaje: "El archivo no existe en el servidor.",
      });
    }

    console.error("Error al consultar documento:", error);

    res.status(500).json({
      mensaje: "No se pudo consultar el documento.",
    });
  }
};



export const guardarEvaluacion = async (req, res) => {
  try {
    const candidatoId = Number(req.params.id);
    const {
      puntuacion,
      clasificacion,
      observaciones,
      resultado = "PENDIENTE",
    } = req.body;

    if (!Number.isInteger(candidatoId) || candidatoId <= 0) {
      return res.status(400).json({
        mensaje: "Identificador de candidato inválido.",
      });
    }

    const nota = Number(puntuacion);

    if (!Number.isInteger(nota) || nota < 1 || nota > 10) {
      return res.status(400).json({
        mensaje: "La puntuación debe ser un número entero entre 1 y 10.",
      });
    }

    const clasificacionesPermitidas = [
      "Informativo",
      "Bueno",
      "Excelente",
      "Requiere seguimiento",
    ];

    if (!clasificacionesPermitidas.includes(clasificacion)) {
      return res.status(400).json({
        mensaje: "La clasificación no es válida.",
      });
    }

    if (
      typeof observaciones !== "string" ||
      !observaciones.trim()
    ) {
      return res.status(400).json({
        mensaje: "Debes registrar las observaciones.",
      });
    }

    if (!["PENDIENTE", "APROBADO", "REPROBADO"].includes(resultado)) {
      return res.status(400).json({
        mensaje: "El resultado de la evaluación no es válido.",
      });
    }

    const candidato = await prisma.candidato.findUnique({
      where: { id: candidatoId },
      include: {
        entrevistas: {
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });

    if (!candidato) {
      return res.status(404).json({
        mensaje: "Candidato no encontrado.",
      });
    }

    const entrevista = candidato.entrevistas[0];

    if (
      !entrevista ||
      entrevista.estadoEntrevista !== "REALIZADA" ||
      new Date(entrevista.fecha).getTime() > Date.now()
    ) {
      return res.status(409).json({
        mensaje: "Debes completar la entrevista antes de evaluar al candidato.",
      });
    }

    const datos = {
      puntuacion: nota,
      clasificacion,
      observaciones: observaciones.trim(),
      resultado,
    };

    const evaluacion = await prisma.evaluacion.upsert({
      where: { candidatoId },
      update: datos,
      create: {
        candidatoId,
        ...datos,
      },
    });

    res.json(evaluacion);
  } catch (error) {
    console.error("Error al guardar evaluación:", error);

    res.status(500).json({
      mensaje: "No se pudo guardar la evaluación.",
    });
  }
};



export const guardarOferta = async (req, res) => {
  try {
    const candidatoId = Number(req.params.id);
    const { tipoContrato, salario, fechaInicio } = req.body;

    if (!Number.isInteger(candidatoId) || candidatoId <= 0) {
      return res.status(400).json({
        mensaje: "Identificador de candidato inválido.",
      });
    }

    const contratosPermitidos = [
      "Término fijo",
      "Indefinido",
      "Temporal",
    ];

    if (!contratosPermitidos.includes(tipoContrato)) {
      return res.status(400).json({
        mensaje: "Selecciona un tipo de contrato válido.",
      });
    }

    const salarioTexto = String(salario ?? "").trim();
    const salarioNumero = Number(salarioTexto);

    if (
      !/^\d+(\.\d{1,2})?$/.test(salarioTexto) ||
      !Number.isFinite(salarioNumero) ||
      salarioNumero <= 0
    ) {
      return res.status(400).json({
        mensaje: "El salario debe ser mayor que cero y tener máximo dos decimales.",
      });
    }

    if (
      typeof fechaInicio !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)
    ) {
      return res.status(400).json({
        mensaje: "Selecciona una fecha de inicio válida.",
      });
    }

    const fecha = new Date(`${fechaInicio}T12:00:00.000Z`);

    if (
      Number.isNaN(fecha.getTime()) ||
      fecha.toISOString().slice(0, 10) !== fechaInicio
    ) {
      return res.status(400).json({
        mensaje: "La fecha de inicio no es válida.",
      });
    }

    const hoy = new Date().toLocaleDateString("sv-SE", {
      timeZone: "America/Tegucigalpa",
    });

    if (fechaInicio < hoy) {
      return res.status(400).json({
        mensaje: "La fecha de inicio no puede ser anterior a hoy.",
      });
    }

    const candidato = await prisma.candidato.findUnique({
      where: { id: candidatoId },
      include: {
        evaluacion: true,
        oferta: true,
      },
    });

    if (!candidato) {
      return res.status(404).json({
        mensaje: "Candidato no encontrado.",
      });
    }

    if (candidato.estado !== "EN_PROCESO") {
      return res.status(409).json({
        mensaje: "El candidato ya no está activo en el proceso.",
      });
    }

    if (candidato.evaluacion?.resultado !== "APROBADO") {
      return res.status(409).json({
        mensaje: "El candidato debe aprobar la evaluación antes de recibir una oferta.",
      });
    }

    if (
      candidato.oferta &&
      candidato.oferta.estado !== "PENDIENTE"
    ) {
      return res.status(409).json({
        mensaje: "No puedes modificar una oferta aceptada o rechazada.",
      });
    }

    const datos = {
      tipoContrato,
      salario: salarioTexto,
      fechaInicio: fecha,
    };

    const oferta = await prisma.oferta.upsert({
      where: { candidatoId },
      update: datos,
      create: {
        candidatoId,
        ...datos,
        estado: "PENDIENTE",
      },
    });

    res.json({
      mensaje: "Oferta guardada correctamente.",
      oferta,
    });
  } catch (error) {
    console.error("Error al guardar oferta:", error);

    res.status(500).json({
      mensaje: "No se pudo guardar la oferta.",
    });
  }
};



export const responderOferta = async (req, res) => {
  try {
    const candidatoId = Number(req.params.id);
    const { respuesta } = req.body;

    if (!Number.isInteger(candidatoId) || candidatoId <= 0) {
      return res.status(400).json({
        mensaje: "Candidato inválido.",
      });
    }

    if (!["ACEPTADA", "RECHAZADA"].includes(respuesta)) {
      return res.status(400).json({
        mensaje: "Respuesta de oferta inválida.",
      });
    }

    const candidato = await prisma.candidato.findUnique({
      where: { id: candidatoId },
    });

    if (!candidato) {
      return res.status(404).json({
        mensaje: "Candidato no encontrado.",
      });
    }

    if (
      candidato.estado !== "EN_PROCESO" ||
      candidato.etapa !== "OFERTA"
    ) {
      return res.status(409).json({
        mensaje: "El candidato debe estar activo y en etapa de Oferta.",
      });
    }

    const actualizacion = await prisma.oferta.updateMany({
      where: {
        candidatoId,
        estado: "PENDIENTE",
      },
      data: {
        estado: respuesta,
        fechaRespuesta: new Date(),
      },
    });

    if (actualizacion.count === 0) {
      return res.status(409).json({
        mensaje: "No existe una oferta pendiente para este candidato.",
      });
    }

    const oferta = await prisma.oferta.findUnique({
      where: { candidatoId },
    });

    res.json({
      mensaje: "Respuesta registrada correctamente.",
      oferta,
    });
  } catch (error) {
    console.error("Error al responder oferta:", error);

    res.status(500).json({
      mensaje: "No se pudo registrar la respuesta.",
    });
  }
};



export const descartarCandidato = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const motivo =
      typeof req.body?.motivo === "string"
        ? req.body.motivo.trim()
        : "";

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID del candidato no es válido",
      });
    }

    if (motivo.length < 5 || motivo.length > 500) {
      return res.status(400).json({
        mensaje: "El motivo debe tener entre 5 y 500 caracteres",
      });
    }

    const candidato = await prisma.candidato.findUnique({
      where: { id },
      include: { empleado: true },
    });

    if (!candidato) {
      return res.status(404).json({
        mensaje: "Candidato no encontrado",
      });
    }

    if (candidato.estado !== "EN_PROCESO" || candidato.empleado) {
      return res.status(409).json({
        mensaje: "Este candidato no puede ser descartado",
      });
    }

    const resultado = await prisma.candidato.updateMany({
      where: {
        id,
        estado: "EN_PROCESO",
        empleado: { is: null },
      },
      data: {
        estado: "DESCARTADO",
        motivoDescarte: motivo,
        fechaDescarte: new Date(),
      },
    });

    if (resultado.count !== 1) {
      return res.status(409).json({
        mensaje: "El estado del candidato cambió. Actualiza la página.",
      });
    }

    const actualizado = await prisma.candidato.findUnique({
      where: { id },
    });

    return res.json({
      mensaje: "Candidato descartado correctamente",
      candidato: actualizado,
    });
  } catch (error) {
    console.error("Error al descartar candidato:", error);
    return res.status(500).json({
      mensaje: "Error al descartar candidato",
    });
  }
};




export const obtenerCatalogosContratacion = async (req, res) => {
  try {
    const areas = await prisma.area.findMany({
      select: {
        id: true,
        nombre: true,
        puestos: {
          select: {
            id: true,
            nombre: true,
            areaId: true,
          },
          orderBy: { nombre: "asc" },
        },
      },
      orderBy: { nombre: "asc" },
    });

    return res.json({ areas });
  } catch (error) {
    console.error("Error al obtener catálogos:", error);
    return res.status(500).json({
      mensaje: "No se pudieron cargar las áreas y puestos",
    });
  }
};



export const contratarCandidato = async (req, res) => {
  const id = Number(req.params.id);

  const texto = (valor) =>
    typeof valor === "string" ? valor.trim() : "";

  const identidad = texto(req.body?.identidad);
  const telefono = texto(req.body?.telefono);
  const correo = texto(req.body?.correo);
  const puestoId = Number(req.body?.puestoId);
  const areaId = Number(req.body?.areaId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      mensaje: "ID de candidato inválido",
    });
  }

  if (!identidad || !telefono || !correo) {
    return res.status(400).json({
      mensaje: "Identidad, teléfono y correo son obligatorios",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({
      mensaje: "El correo no es válido",
    });
  }

  if (
    !Number.isSafeInteger(puestoId) ||
    puestoId <= 0 ||
    !Number.isSafeInteger(areaId) ||
    areaId <= 0
  ) {
    return res.status(400).json({
      mensaje: "Debes seleccionar un área y un puesto válidos",
    });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const candidato = await tx.candidato.findUnique({
        where: { id },
        include: {
          oferta: true,
          empleado: true,
        },
      });

      if (!candidato) {
        throw Object.assign(
          new Error("Candidato no encontrado"),
          { status: 404 }
        );
      }

      if (
        candidato.estado !== "EN_PROCESO" ||
        candidato.etapa !== "OFERTA" ||
        candidato.empleado
      ) {
        throw Object.assign(
          new Error("El candidato no puede ser contratado"),
          { status: 409 }
        );
      }

      if (candidato.oferta?.estado !== "ACEPTADA") {
        throw Object.assign(
          new Error("El candidato debe aceptar la oferta primero"),
          { status: 409 }
        );
      }

      const puesto = await tx.puesto.findUnique({
        where: { id: puestoId },
      });

      if (!puesto || puesto.areaId !== areaId) {
        throw Object.assign(
          new Error("El puesto no pertenece al área seleccionada"),
          { status: 400 }
        );
      }

      const salarioBase = Number(candidato.oferta.salario);
      const fechaIngreso = new Date(candidato.oferta.fechaInicio);

      if (
        !Number.isFinite(salarioBase) ||
        salarioBase <= 0 ||
        Number.isNaN(fechaIngreso.getTime())
      ) {
        throw Object.assign(
          new Error("Los datos de la oferta no son válidos"),
          { status: 400 }
        );
      }

      const actualizacion = await tx.candidato.updateMany({
        where: {
          id,
          estado: "EN_PROCESO",
          etapa: "OFERTA",
          empleado: { is: null },
        },
        data: {
          estado: "CONTRATADO",
          etapa: "CONTRATADO",
        },
      });

      if (actualizacion.count !== 1) {
        throw Object.assign(
          new Error("El estado del candidato cambió. Actualiza la página."),
          { status: 409 }
        );
      }

      const empleado = await tx.empleado.create({
        data: {
          nombres: candidato.nombre.trim(),
          apellidos: candidato.apellido.trim(),
          identidad,
          telefono,
          correo,
          puestoId,
          areaId,
          salarioBase,
          fechaIngreso,
          candidatoId: id,
        },
      });

      return empleado;
    });

    return res.status(201).json({
      mensaje: "Candidato contratado y registrado como empleado",
      empleado: resultado,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        mensaje:
          "Ya existe un empleado con esa identidad, correo o candidato asociado",
      });
    }

    if (error.status) {
      return res.status(error.status).json({
        mensaje: error.message,
      });
    }

    console.error("Error al contratar candidato:", error);
    return res.status(500).json({
      mensaje: "No se pudo completar la contratación",
    });
  }
};
