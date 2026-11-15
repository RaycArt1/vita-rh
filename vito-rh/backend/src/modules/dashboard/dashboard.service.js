import prisma from "../../config/prisma.js";

function obtenerRangosFecha() {
  const ahora = new Date();

  const inicioDia = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  );

  // Semana de lunes a domingo, según la fecha local del servidor.
  const inicioSemana = new Date(inicioDia);
  const diasDesdeLunes = (inicioSemana.getDay() + 6) % 7;
  inicioSemana.setDate(inicioSemana.getDate() - diasDesdeLunes);

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(finSemana.getDate() + 7);
  finSemana.setMilliseconds(-1);

  const limiteEventos = new Date(inicioDia);
  limiteEventos.setDate(limiteEventos.getDate() + 7);
  limiteEventos.setMilliseconds(-1);

  return { ahora, inicioDia, inicioSemana, finSemana, limiteEventos };
}

function nombreEmpleado(empleado) {
  if (!empleado) return "Empleado";
  return `${empleado.nombres ?? ""} ${empleado.apellidos ?? ""}`.trim() || "Empleado";
}

export async function obtenerResumenDashboard() {
  const { ahora, inicioDia, inicioSemana, finSemana, limiteEventos } =
    obtenerRangosFecha();

  const [
    empleadosActivos,
    turnosSemana,
    vacacionesPendientes,
    candidatosEnProceso,
    expedientes,
    llamadosAtencion,
    reportesGraves,
    reportesModerados,
    reportesInformativosLeves,
    actividad,
    entrevistas,
    vacacionesProximas,
    nominasProximas,
  ] = await Promise.all([
    prisma.empleado.count({
      where: { estado: "ACTIVO" },
    }),

    prisma.horario.count({
      where: {
        estado: { in: ["ACTIVO", "MODIFICADO"] },
        fechaInicio: { lte: finSemana },
        fechaFin: { gte: inicioSemana },
      },
    }),

    prisma.solicitud.count({
      where: {
        tipoSolicitud: "VACACION",
        estado: "PENDIENTE",
      },
    }),

    prisma.candidato.count({
      where: { estado: "EN_PROCESO" },
    }),

    prisma.expediente.count(),

    prisma.llamadoAtencion.count(),

    prisma.reporteIncidencia.count({
      where: { gravedad: "Grave" },
    }),

    prisma.reporteIncidencia.count({
      where: { gravedad: "Moderado" },
    }),

    prisma.reporteIncidencia.count({
      where: { gravedad: { in: ["Informativo", "Leve"] } },
    }),

    prisma.bitacora.findMany({
      take: 5,
      orderBy: { fechaHora: "desc" },
      include: {
        usuario: {
          select: {
            username: true,
            empleado: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
    }),

    prisma.entrevista.findMany({
      where: {
        fecha: {
          gte: inicioDia,
          lte: limiteEventos,
        },
      },
      take: 10,
      orderBy: { fecha: "asc" },
      include: {
        candidato: {
          select: {
            nombre: true,
            apellido: true,
            puestoAplicado: true,
          },
        },
      },
    }),

    prisma.solicitud.findMany({
      where: {
        tipoSolicitud: "VACACION",
        estado: "APROBADA",
        fechaInicio: {
          gte: inicioDia,
          lte: limiteEventos,
        },
      },
      take: 10,
      orderBy: { fechaInicio: "asc" },
      include: {
        empleado: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),

    prisma.nomina.findMany({
      where: {
        fechaPago: {
          gte: inicioDia,
          lte: limiteEventos,
        },
      },
      take: 10,
      orderBy: { fechaPago: "asc" },
      include: {
        empleado: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),
  ]);

  const eventos = [
    ...entrevistas.map((entrevista) => ({
      id: `entrevista-${entrevista.id}`,
      fecha: entrevista.fecha,
      tipo: "ENTREVISTA",
      titulo: "ENTREVISTA",
      descripcion: `${entrevista.candidato.nombre} ${entrevista.candidato.apellido} — ${entrevista.candidato.puestoAplicado}`,
    })),

    ...vacacionesProximas.map((solicitud) => ({
      id: `vacacion-${solicitud.id}`,
      fecha: solicitud.fechaInicio,
      tipo: "VACACIONES",
      titulo: "VACACIONES",
      descripcion: `Inicio de vacaciones — ${nombreEmpleado(solicitud.empleado)}`,
    })),

    ...nominasProximas.map((nomina) => ({
      id: `nomina-${nomina.id}`,
      fecha: nomina.fechaPago,
      tipo: "NOMINA",
      titulo: "NÓMINA",
      descripcion: `Pago programado — ${nombreEmpleado(nomina.empleado)}`,
    })),
  ]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 4);

  const actividadFormateada = actividad.map((registro) => {
    const empleado = registro.usuario?.empleado;
    const usuario = empleado
      ? nombreEmpleado(empleado)
      : registro.usuario?.username ?? "Usuario";

    return {
      id: registro.id,
      usuario,
      accion: registro.accion,
      tabla: registro.tablaAfectada,
      descripcion:
        registro.descripcion ||
        `${registro.accion} en ${registro.tablaAfectada}`,
      fecha: registro.fechaHora,
    };
  });

  return {
    actualizadoEn: ahora,
    tarjetas: {
      empleadosActivos,
      turnosSemana,
      vacacionesPendientes,
      candidatosEnProceso,
    },
    metricas: {
      reportesGraves,
      reportesModerados,
      reportesInformativosLeves,
      entrevistasProximas: entrevistas.length,
    },
    actividad: actividadFormateada,
    eventos,
  };
}
