
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
  const fecha = obtenerFechaValida(`${fechaTexto}T12:00:00`, "fecha");
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

  const fechaFin = fecha;

  return prisma.$transaction(async (tx) => {
    if (valor === "DESCANSO") {
      await tx.horario.deleteMany({
        where: { empleadoId, fechaInicio: fecha, fechaFin },
      });

      return tx.descanso.upsert({
        where: {
          empleadoId_fecha: { empleadoId, fecha },
        },
        update: { creadoPorId },
        create: { empleadoId, creadoPorId, fecha },
        include: { empleado: true },
      });
    }

    if (valor === "SIN_ASIGNAR") {
      await tx.horario.deleteMany({
        where: { empleadoId, fechaInicio: fecha, fechaFin },
      });

      await tx.descanso.deleteMany({
        where: { empleadoId, fecha },
      });

      return { empleadoId, fecha, asignacion: "SIN_ASIGNAR" };
    }

    await tx.descanso.deleteMany({
      where: { empleadoId, fecha },
    });

    return tx.horario.upsert({
      where: {
        empleadoId_fechaInicio_fechaFin: {
          empleadoId,
          fechaInicio: fecha,
          fechaFin,
        },
      },
      update: {
        turno: valor,
        areaId: empleado.areaId,
        creadoPorId,
      },
      create: {
        fechaInicio: fecha,
        fechaFin,
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

  // Volvemos a generar la propuesta desde el servidor.
  const vistaPrevia = await generadorService.generarVistaPrevia({
    mes,
    modo,
  });

  if (vistaPrevia.conflictos.length > 0) {
    throw new Error(
      "No se puede guardar la planificación porque existen conflictos."
    );
  }

  if (
    vistaPrevia.propuestas.some((p) => p.valor === "SIN_ASIGNAR")
  ) {
    throw new Error(
      "No se puede guardar la planificación porque existen días sin asignar."
    );
  }

  const [anio, numeroMes] = mes.split("-").map(Number);
  const ultimoDia = new Date(
    Date.UTC(anio, numeroMes, 0)
  ).getUTCDate();

  const inicioTexto = `${mes}-01`;
  const finTexto = `${mes}-${String(ultimoDia).padStart(2, "0")}`;

  const fechaInicio = new Date(`${inicioTexto}T12:00:00`);
  const fechaFin = new Date(`${finTexto}T12:00:00`);

  const inicioDescansos = new Date(`${inicioTexto}T00:00:00.000Z`);
  const finDescansos = new Date(`${finTexto}T23:59:59.999Z`);

  // En modo completar solo guardamos lo que acaba de generar el algoritmo.
  // En modo reemplazar guardamos todas las propuestas del mes.
  const propuestasGuardar = vistaPrevia.propuestas.filter((p) => {
    return modo === "reemplazar" || p.origen === "generado";
  });

  return prisma.$transaction(async (tx) => {
    if (modo === "reemplazar") {
      // Eliminamos los horarios del mes.
      await tx.horario.deleteMany({
        where: {
          fechaInicio: {
            gte: fechaInicio,
            lte: fechaFin,
          },
        },
      });

      // Eliminamos los descansos del mes.
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
      const fechaDescanso = new Date(
        `${propuesta.fecha}T00:00:00.000Z`
      );

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
          throw new Error(
            `El empleado ${empleadoId} ya no está activo.`
          );
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