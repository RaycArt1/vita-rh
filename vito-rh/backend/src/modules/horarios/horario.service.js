import prisma from "../../config/prisma.js";

import * as generadorService from "./generador.service.js";

 

const TURNOS_VALIDOS = ["T12_20", "T12_22"];

 

function obtenerFechaValida(valor, campo) {

  const fecha = new Date(valor);

 

  if (!valor || Number.isNaN(fecha.getTime())) {

    throw new Error(`${campo} no es una fecha válida.`);

  }

 

  return fecha;

}

 

export async function obtenerHorarios() {

  return prisma.horario.findMany({

    include: {

      empleado: true,

      area: true,

      creadoPor: true,

    },

    orderBy: {

      fechaInicio: "asc",

    },

  });

}

 

export async function crearHorario(data) {

  const fechaInicio = obtenerFechaValida(data.fechaInicio, "fechaInicio");

  const fechaFin = obtenerFechaValida(data.fechaFin, "fechaFin");

 

  if (fechaFin < fechaInicio) {

    throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio.");

  }

 

  if (!TURNOS_VALIDOS.includes(data.turno)) {

    throw new Error("El turno debe ser T12_20 o T12_22.");

  }

 

  const empleadoId = Number(data.empleadoId);

  const areaId = Number(data.areaId);

  const creadoPorId = Number(data.creadoPorId);

 

  if (

    !Number.isInteger(empleadoId) ||

    !Number.isInteger(areaId) ||

    !Number.isInteger(creadoPorId)

  ) {

    throw new Error("empleadoId, areaId y creadoPorId son obligatorios y deben ser números enteros.");

  }

 

  return prisma.horario.upsert({

    where: {

      empleadoId_fechaInicio_fechaFin: {

        empleadoId,

        fechaInicio,

        fechaFin,

      },

    },

    update: {

      turno: data.turno,

      areaId,

      creadoPorId,

    },

    create: {

      fechaInicio,

      fechaFin,

      turno: data.turno,

      empleadoId,

      areaId,

      creadoPorId,

    },

    include: {

      empleado: true,

      area: true,

      creadoPor: true,

    },

  });

}

 

export async function cambiarAsignacion(data) {

  const empleadoId = Number(data.empleadoId);

  const creadoPorId = Number(data.creadoPorId);

  const fechaTexto = String(data.fecha ?? "").slice(0, 10);

  const valor = data.valor;

 

  if (

    !Number.isInteger(empleadoId) ||

    empleadoId <= 0 ||

    !Number.isInteger(creadoPorId) ||

    creadoPorId <= 0

  ) {

    throw new Error("El empleado y el usuario administrador son obligatorios.");

  }

 

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTexto)) {

    throw new Error("La fecha debe tener el formato YYYY-MM-DD.");

  }

 

  const fechaDescanso = new Date(`${fechaTexto}T00:00:00.000Z`);

 

  if (

    Number.isNaN(fechaDescanso.getTime()) ||

    fechaDescanso.toISOString().slice(0, 10) !== fechaTexto

  ) {

    throw new Error("La fecha no es válida.");

  }

 

  if (!["T12_20", "T12_22", "DESCANSO", "SIN_ASIGNAR"].includes(valor)) {

    throw new Error("La asignación seleccionada no es válida.");

  }

 

  const empleado = await prisma.empleado.findUnique({

    where: { id: empleadoId },

    select: { id: true, areaId: true, estado: true },

  });

 

  if (!empleado || empleado.estado !== "ACTIVO") {

    throw new Error("El empleado no existe o está inactivo.");

  }

 

  // Horario usa mediodía local; Descanso usa medianoche UTC.

  const fechaHorario = new Date(`${fechaTexto}T12:00:00`);

 

  return prisma.$transaction(async (tx) => {

    if (valor === "DESCANSO") {

const descansoArea = await tx.descanso.findFirst({

        where: {

          fecha: fechaDescanso,

          empleadoId: { not: empleadoId },

          empleado: {

            areaId: empleado.areaId,

          },

        },

        include: {

          empleado: {

            select: {

              nombres: true,

              apellidos: true,

            },

          },

        },

      });

 

      if (descansoArea) {

        throw new Error(

          `Otra persona de esta área ya tiene descanso asignado ese día: ${descansoArea.empleado.nombres} ${descansoArea.empleado.apellidos}.`

        );

      }

 

      await tx.horario.deleteMany({

        where: {

          empleadoId,

          fechaInicio: fechaHorario,

          fechaFin: fechaHorario,

        },

      });

 

      const descanso = await tx.descanso.upsert({

        where: {

          empleadoId_fecha: {

            empleadoId,

            fecha: fechaDescanso,

          },

        },

        update: {

          creadoPorId,

        },

        create: {

          empleadoId,

          fecha: fechaDescanso,

          creadoPorId,

        },

        include: {

          empleado: true,

        },

      });

 

      // Salir aquí evita enviar "DESCANSO" al enum TurnoHorario.

      return {

        empleadoId,

        fecha: fechaTexto,

        asignacion: "DESCANSO",

        descanso,

      };

    }

 

    if (valor === "SIN_ASIGNAR") {

      await tx.horario.deleteMany({

        where: {

          empleadoId,

          fechaInicio: fechaHorario,

          fechaFin: fechaHorario,

        },

      });

 

      await tx.descanso.deleteMany({

        where: {

          empleadoId,

          fecha: fechaDescanso,

        },

      });

 

      return {

        empleadoId,

        fecha: fechaTexto,

        asignacion: "SIN_ASIGNAR",

      };

    }

 

    // A partir de aquí solo pueden llegar turnos válidos.

    if (!TURNOS_VALIDOS.includes(valor)) {

      throw new Error("El turno debe ser T12_20 o T12_22.");

    }

 

    await tx.descanso.deleteMany({

      where: {

        empleadoId,

        fecha: fechaDescanso,

      },

    });

 

    return tx.horario.upsert({

      where: {

        empleadoId_fechaInicio_fechaFin: {

          empleadoId,

          fechaInicio: fechaHorario,

          fechaFin: fechaHorario,

        },

      },

      update: {

        turno: valor,

        areaId: empleado.areaId,

        creadoPorId,

      },

      create: {

        fechaInicio: fechaHorario,

        fechaFin: fechaHorario,

        turno: valor,

        empleadoId,

        areaId: empleado.areaId,

        creadoPorId,

      },

      include: {

        empleado: true,

        area: true,

        creadoPor: true,

      },

    });

  });

}

 

export async function guardarPlanificacion(data) {

  const mes = String(data.mes ?? "");

  const modo = data.modo;

  const creadoPorId = Number(data.creadoPorId);

 

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {

    throw new Error("El mes debe tener el formato YYYY-MM.");

  }

 

  if (!["completar", "reemplazar"].includes(modo)) {

    throw new Error("El modo debe ser completar o reemplazar.");

  }

 

  if (!Number.isInteger(creadoPorId) || creadoPorId <= 0) {

    throw new Error("El usuario administrador no es válido.");

  }

 

  const vistaPrevia = await generadorService.generarVistaPrevia({

    mes,

    modo,

  });

 

  if (vistaPrevia.conflictos.length > 0) {

    throw new Error(

      "No se puede guardar la planificación porque existen conflictos."

    );

  }

 

  if (vistaPrevia.propuestas.some((p) => p.valor === "SIN_ASIGNAR")) {

    throw new Error(

      "No se puede guardar la planificación porque existen días sin asignar."

    );

  }

 

  const [anio, numeroMes] = mes.split("-").map(Number);

  const ultimoDia = new Date(Date.UTC(anio, numeroMes, 0)).getUTCDate();

 

  const inicioTexto = `${mes}-01`;

  const finTexto = `${mes}-${String(ultimoDia).padStart(2, "0")}`;

 

  const fechaInicio = new Date(`${inicioTexto}T12:00:00`);

  const fechaFin = new Date(`${finTexto}T12:00:00`);

  const inicioDescansos = new Date(`${inicioTexto}T00:00:00.000Z`);

  const finDescansos = new Date(`${finTexto}T23:59:59.999Z`);

 

  const propuestasGuardar = vistaPrevia.propuestas.filter((p) => {

    return modo === "reemplazar" || p.origen === "generado";

  });

 

  return prisma.$transaction(async (tx) => {

    if (modo === "reemplazar") {

      await tx.horario.deleteMany({

        where: {

          fechaInicio: {

            gte: fechaInicio,

            lte: fechaFin,

          },

        },

      });

 

      await tx.descanso.deleteMany({

        where: {

          fecha: {

            gte: inicioDescansos,

            lte: finDescansos,

          },

        },

      });

    }

 

    let horariosGuardados = 0;

    let descansosGuardados = 0;

 

    for (const propuesta of propuestasGuardar) {

      const empleadoId = Number(propuesta.empleadoId);

 

      if (!Number.isInteger(empleadoId) || empleadoId <= 0) {

        throw new Error("Se encontró un empleado con identificador inválido.");

      }

 

      const fechaHorario = new Date(`${propuesta.fecha}T12:00:00`);

      const fechaDescanso = new Date(`${propuesta.fecha}T00:00:00.000Z`);

 

      if (propuesta.valor === "DESCANSO") {

        await tx.descanso.create({

          data: {

            empleadoId,

            fecha: fechaDescanso,

            creadoPorId,

          },

        });

 

        descansosGuardados++;

      } else if (

        propuesta.valor === "T12_20" ||

        propuesta.valor === "T12_22"

      ) {

        const empleado = await tx.empleado.findUnique({

          where: { id: empleadoId },

          select: { id: true, areaId: true, estado: true },

        });

 

        if (!empleado || empleado.estado !== "ACTIVO") {

          throw new Error(`El empleado ${empleadoId} ya no está activo.`);

        }

 

        await tx.horario.create({

          data: {

            fechaInicio: fechaHorario,

            fechaFin: fechaHorario,

            turno: propuesta.valor,

            empleadoId,

            areaId: empleado.areaId,

            creadoPorId,

          },

        });

 

        horariosGuardados++;

      } else {

        throw new Error(

          `Se encontró una asignación inválida: ${propuesta.valor}.`

        );

      }

    }

 

    return {

      mensaje: "La planificación se guardó correctamente.",

      mes,

      modo,

      horariosGuardados,

      descansosGuardados,

      totalGuardado: horariosGuardados + descansosGuardados,

    };

  });

}