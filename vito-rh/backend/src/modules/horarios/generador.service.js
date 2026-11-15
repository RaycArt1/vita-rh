import prisma from "../../config/prisma.js";

 

const TURNOS = ["T12_20", "T12_22"];

const MAXIMO_CONSECUTIVOS = 7;

const DIAS_HISTORIAL = 30;

 

function fechaUTC(texto) {

  return new Date(`${texto}T00:00:00.000Z`);

}

 

function sumarDias(fecha, cantidad) {

  const resultado = new Date(fecha);

  resultado.setUTCDate(resultado.getUTCDate() + cantidad);

  return resultado;

}

 

function fechaTexto(fecha) {

  return fecha.toISOString().slice(0, 10);

}

 

function obtenerDiasMes(mes) {

  if (!/^\d{4}-\d{2}$/.test(mes)) {

    throw new Error("El mes debe tener el formato YYYY-MM.");

  }

 

  const [anio, numeroMes] = mes.split("-").map(Number);

 

  if (numeroMes < 1 || numeroMes > 12) {

    throw new Error("El mes indicado no es válido.");

  }

 

  const inicio = fechaUTC(`${mes}-01`);

 

  const ultimoDia = new Date(

    Date.UTC(anio, numeroMes, 0)

  ).getUTCDate();

 

  const fin = fechaUTC(

    `${mes}-${String(ultimoDia).padStart(2, "0")}`

  );

 

  const dias = [];

 

  for (

    let fecha = inicio;

    fecha <= fin;

    fecha = sumarDias(fecha, 1)

  ) {

    dias.push(fechaTexto(fecha));

  }

 

  return dias;

}

 

function claveAsignacion(empleadoId, fecha) {

  return `${empleadoId}_${fecha}`;

}

 

function obtenerFechaRegistro(fecha) {

  return new Date(`${fecha}T12:00:00`);

}

 

function esTurno(valor) {

  return TURNOS.includes(valor);

}

 

function esDiaDescansoPermitido(fecha) {

  const dia = fechaUTC(fecha).getUTCDay();

 

  // 0 = domingo, 1 = lunes ... 6 = sábado.

  return dia >= 1 && dia <= 4;

}

 

function crearRegistro(empleado, fecha, valor, origen) {

  return {

    empleadoId: empleado.id,

    empleado: `${empleado.nombres} ${empleado.apellidos}`,

    areaId: empleado.areaId,

    area: empleado.area?.nombre ?? "Sin área",

    fecha,

    valor,

    origen,

  };

}

 

export async function generarVistaPrevia({ mes, modo }) {

  if (!["completar", "reemplazar"].includes(modo)) {

    throw new Error("El modo debe ser completar o reemplazar.");

  }

 

  const dias = obtenerDiasMes(mes);

  const inicio = fechaUTC(dias[0]);

  const fin = fechaUTC(dias[dias.length - 1]);

 

  // Consultamos 30 días anteriores para conocer

  // el historial real de cada empleado.

  const inicioConsulta = sumarDias(inicio, -DIAS_HISTORIAL);

 

  const empleadosConsultados = await prisma.empleado.findMany({

  where: { estado: "ACTIVO" },

  include: {

    area: true,

    usuario: {

      include: {

        role: {

          select: {

            nombre: true,

          },

        },

      },

    },

  },

  orderBy: [{ areaId: "asc" }, { nombres: "asc" }],

});

 

// El administrador no participa en la planificación operativa.

const empleados = empleadosConsultados.filter(

  (empleado) => empleado.usuario?.role?.nombre !== "ADMINISTRADOR"

);

 

  const [horarios, descansos] = await Promise.all([

    prisma.horario.findMany({

      where: {

        fechaInicio: {

          gte: obtenerFechaRegistro(fechaTexto(inicioConsulta)),

          lte: obtenerFechaRegistro(fechaTexto(fin)),

        },

      },

      orderBy: { fechaInicio: "asc" },

    }),

 

    prisma.descanso.findMany({

      where: {

        fecha: {

          gte: inicioConsulta,

          lte: fin,

        },

      },

    }),

  ]);

 

  const asignaciones = new Map();

 

  // Cargar horarios existentes.

  for (const horario of horarios) {

    const fecha = horario.fechaInicio.toISOString().slice(0, 10);

 

    asignaciones.set(

      claveAsignacion(horario.empleadoId, fecha),

      {

        valor: horario.turno,

        origen: "existente",

      }

    );

  }

 

  // Cargar descansos existentes.

  for (const descanso of descansos) {

    const fecha = descanso.fecha.toISOString().slice(0, 10);

 

    asignaciones.set(

      claveAsignacion(descanso.empleadoId, fecha),

      {

        valor: "DESCANSO",

        origen: "existente",

      }

    );

  }

 

  // En reemplazar, se ignoran las asignaciones del mes.

  // El historial anterior permanece intacto.

  if (modo === "reemplazar") {

    for (const empleado of empleados) {

      for (const fecha of dias) {

        asignaciones.delete(

          claveAsignacion(empleado.id, fecha)

        );

      }

    }

  }

 

  const propuestas = [];

  const conflictos = [];

  const alertas = [];

  const alertasCobertura = [];

 

  const empleadosPorId = new Map(

    empleados.map((empleado) => [empleado.id, empleado])

  );

 

  const conflictosRegistrados = new Set();

 

  // Seguimiento de días consecutivos por empleado.

  const consecutivos = new Map();

 

  for (const empleado of empleados) {

    consecutivos.set(empleado.id, 0);

  }

 

  // --------------------------------------------------

  // FASE 1: PLANIFICAR DESCANSOS CON ANTICIPACIÓN

  // --------------------------------------------------

 

  const todasLasFechas = [];

 

  for (

    let fecha = inicioConsulta;

    fecha <= fin;

    fecha = sumarDias(fecha, 1)

  ) {

    todasLasFechas.push(fechaTexto(fecha));

  }

 

  function agregarConflicto(empleado, fecha, mensaje) {

    const claveConflicto = `${empleado.id}_${fecha}_${mensaje}`;

 

    if (conflictosRegistrados.has(claveConflicto)) return;

 

    conflictosRegistrados.add(claveConflicto);

    conflictos.push({

      empleadoId: empleado.id,

      empleado: `${empleado.nombres} ${empleado.apellidos}`,

      fecha,

      mensaje,

    });

  }

 

  function tieneDescansoArea(areaId, fecha) {

    return empleados.some((empleado) => {

      if ((empleado.areaId ?? 0) !== areaId) return false;

 

      return (

        asignaciones.get(claveAsignacion(empleado.id, fecha))?.valor ===

        "DESCANSO"

      );

    });

  }

 

  function contarEspaciosFuturos(areaId, fechaActual, fechaLimite, candidatos) {

    let espacios = 0;

 

    for (

      let dia = sumarDias(fechaUTC(fechaActual), 1);

      dia <= fechaLimite;

      dia = sumarDias(dia, 1)

    ) {

      const textoDia = fechaTexto(dia);

 

      if (!esDiaDescansoPermitido(textoDia)) continue;

      if (tieneDescansoArea(areaId, textoDia)) continue;

 

      // Un día futuro cuenta como espacio si al menos uno de los

      // empleados pendientes de esta área todavía puede descansar.

      const alguienDisponible = candidatos.some((empleado) => {

        return !asignaciones.has(claveAsignacion(empleado.id, textoDia));

      });

 

      if (alguienDisponible) espacios++;

    }

 

    return espacios;

  }

 

  for (const fecha of todasLasFechas) {

    const perteneceAlMes =

      fecha >= dias[0] && fecha <= dias[dias.length - 1];

 

    // El historial anterior al mes solo se utiliza para calcular rachas.

    if (!perteneceAlMes) {

      for (const empleado of empleados) {

        const actual = asignaciones.get(

          claveAsignacion(empleado.id, fecha)

        );

 

        if (actual?.valor === "DESCANSO") {

          consecutivos.set(empleado.id, 0);

        } else if (esTurno(actual?.valor)) {

          consecutivos.set(

            empleado.id,

            consecutivos.get(empleado.id) + 1

          );

        } else {

          // Si no existe información de ese día, no asumimos que trabajó.

          consecutivos.set(empleado.id, 0);

        }

      }

 

      continue;

    }

 

    const empleadosPendientesPorArea = new Map();

    const descansosExistentesPorArea = new Map();

 

    // Primero respetamos y validamos todas las asignaciones existentes.

    for (const empleado of empleados) {

      const clave = claveAsignacion(empleado.id, fecha);

      const actual = asignaciones.get(clave);

      const areaId = empleado.areaId ?? 0;

 

      if (!actual) {

        if (!empleadosPendientesPorArea.has(areaId)) {

          empleadosPendientesPorArea.set(areaId, []);

        }

 

        empleadosPendientesPorArea.get(areaId).push(empleado);

        continue;

      }

 

      if (actual.valor === "DESCANSO") {

        consecutivos.set(empleado.id, 0);

 

        if (!esDiaDescansoPermitido(fecha)) {

          agregarConflicto(

            empleado,

            fecha,

            "Existe un descanso asignado en viernes, sábado o domingo. Debe corregirse manualmente."

          );

        }

 

        const cantidad = descansosExistentesPorArea.get(areaId) ?? 0;

        descansosExistentesPorArea.set(areaId, cantidad + 1);

 

        if (cantidad >= 1) {

          agregarConflicto(

            empleado,

            fecha,

            "Ya existe otro descanso en esta área para el mismo día. Debe corregirse la asignación duplicada."

          );

        }

 

        continue;

      }

 

      if (esTurno(actual.valor)) {

        const nuevoTotal = consecutivos.get(empleado.id) + 1;

        consecutivos.set(empleado.id, nuevoTotal);

 

        if (nuevoTotal > MAXIMO_CONSECUTIVOS) {

          agregarConflicto(

            empleado,

            fecha,

            "Una asignación existente provoca más de 7 días consecutivos. Debe revisarse manualmente."

          );

        }

      }

    }

 

    // Cada área se planifica por separado: máximo un descanso diario.

    for (const [areaId, candidatos] of empleadosPendientesPorArea.entries()) {

      const descansoYaAsignado =

        (descansosExistentesPorArea.get(areaId) ?? 0) > 0;

 

      let empleadoQueDescansaHoy = null;

 

      if (esDiaDescansoPermitido(fecha) && !descansoYaAsignado) {

        // Fecha límite individual: si trabaja hasta ese día, todavía

        // podrá descansar antes de completar 8 jornadas consecutivas.

        const candidatosConLimite = candidatos.map((empleado) => {

          const racha = consecutivos.get(empleado.id);

          const diasHastaLimite = Math.max(0, MAXIMO_CONSECUTIVOS - racha);

 

          return {

            empleado,

            racha,

            limite: sumarDias(fechaUTC(fecha), diasHastaLimite),

          };

        });

 

        candidatosConLimite.sort((a, b) => {

          if (a.limite.getTime() !== b.limite.getTime()) {

            return a.limite - b.limite;

          }

 

          if (a.racha !== b.racha) return b.racha - a.racha;

          return a.empleado.id - b.empleado.id;

        });

 

        // Si las personas que tienen fechas límite próximas superan

        // los espacios disponibles en los próximos días permitidos,

        // adelantamos uno de sus descansos a hoy.

        for (const candidato of candidatosConLimite) {

          const conLimiteIgualOAnterior = candidatosConLimite.filter(

            (otro) => otro.limite <= candidato.limite

          );

 

          const espaciosFuturos = contarEspaciosFuturos(

            areaId,

            fecha,

            candidato.limite,

            conLimiteIgualOAnterior.map((item) => item.empleado)

          );

 

          if (conLimiteIgualOAnterior.length > espaciosFuturos) {

            empleadoQueDescansaHoy = candidato.empleado;

            break;

          }

        }

      }

 

      for (const empleado of candidatos) {

        const clave = claveAsignacion(empleado.id, fecha);

 

        if (empleadoQueDescansaHoy?.id === empleado.id) {

          asignaciones.set(clave, {

            valor: "DESCANSO",

            origen: "generado",

          });

 

          consecutivos.set(empleado.id, 0);

          continue;

        }

 

        const rachaActual = consecutivos.get(empleado.id);

        const nuevaRacha = rachaActual + 1;

 

        if (nuevaRacha > MAXIMO_CONSECUTIVOS) {

          agregarConflicto(

            empleado,

            fecha,

            descansoYaAsignado

              ? "No se puede asignar descanso porque otra persona de la misma área ya descansa ese día, y asignar otro turno provocaría más de 7 días consecutivos."

              : "No existe un día permitido disponible para asignar el descanso antes de superar 7 días consecutivos. Se necesita revisar la planificación."

          );

 

          asignaciones.set(clave, {

            valor: "SIN_ASIGNAR",

            origen: "generado",

          });

 

          continue;

        }

 

        asignaciones.set(clave, {

          valor: "PENDIENTE_TURNO",

          origen: "generado",

        });

 

        consecutivos.set(empleado.id, nuevaRacha);

      }

    }

  }

 

  // --------------------------------------------------

  // FASE 2: DISTRIBUIR TURNOS POR ÁREA Y DÍA

  // --------------------------------------------------

 

  for (const fecha of dias) {

    const porArea = new Map();

 

    for (const empleado of empleados) {

      const areaId = empleado.areaId ?? 0;

 

      if (!porArea.has(areaId)) {

        porArea.set(areaId, []);

      }

 

      porArea.get(areaId).push(empleado);

    }

 

    for (const grupo of porArea.values()) {

      let cantidadT1 = 0;

      let cantidadT2 = 0;

 

      for (const empleado of grupo) {

        const actual = asignaciones.get(

          claveAsignacion(empleado.id, fecha)

        );

 

        if (actual?.valor === "T12_20") cantidadT1++;

        if (actual?.valor === "T12_22") cantidadT2++;

      }

 

      const pendientes = grupo.filter((empleado) => {

        return (

          asignaciones.get(

            claveAsignacion(empleado.id, fecha)

          )?.valor === "PENDIENTE_TURNO"

        );

      });

 

      pendientes.sort((a, b) => a.id - b.id);

 

      for (const empleado of pendientes) {

        const valor =

          cantidadT1 <= cantidadT2

            ? TURNOS[0]

            : TURNOS[1];

 

        asignaciones.set(

          claveAsignacion(empleado.id, fecha),

          {

            valor,

            origen: "generado",

          }

        );

 

        if (valor === "T12_20") {

          cantidadT1++;

        } else {

          cantidadT2++;

        }

      }

    }

  }

 

  // --------------------------------------------------

  // FASE 3: CONSTRUIR PROPUESTAS

  // --------------------------------------------------

 

  for (const empleado of empleados) {

    for (const fecha of dias) {

      const asignacion = asignaciones.get(

        claveAsignacion(empleado.id, fecha)

      );

 

      const valor = asignacion?.valor ?? "SIN_ASIGNAR";

 

      propuestas.push(

        crearRegistro(

          empleado,

          fecha,

          valor,

          asignacion?.origen ?? "generado"

        )

      );

    }

  }

 

 

  // --------------------------------------------------

  // FASE 4: VALIDAR COBERTURA POR ÁREA Y TURNO

  // --------------------------------------------------

 

  const areas = new Map();

 

  for (const empleado of empleados) {

    const areaId = empleado.areaId ?? 0;

    const nombreArea = empleado.area?.nombre ?? "Sin área";

 

    if (!areas.has(areaId)) {

      areas.set(areaId, {

        id: areaId,

        nombre: nombreArea,

        empleados: [],

      });

    }

 

    areas.get(areaId).empleados.push(empleado);

  }

 

  for (const fecha of dias) {

    for (const area of areas.values()) {

      for (const turno of TURNOS) {

        let personasAsignadas = 0;

 

        for (const empleado of area.empleados) {

          const asignacion = asignaciones.get(

            claveAsignacion(empleado.id, fecha)

          );

 

          if (asignacion?.valor === turno) {

            personasAsignadas++;

          }

        }

 

        if (personasAsignadas < 1) {

          alertasCobertura.push({

            tipo: "COBERTURA",

            areaId: area.id,

            area: area.nombre,

            turno,

            fecha,

            personasAsignadas,

            nivel: "INFORMATIVA",

            mensaje: `El área ${area.nombre} no tiene personal asignado al turno ${turno} el día ${fecha}.`,

          });

        }

      }

    }

  }

 

  // --------------------------------------------------

  // FASE 4: VALIDAR JORNADAS Y GENERAR ALERTAS

  // --------------------------------------------------

 

  for (const empleado of empleados) {

    let rachaActual = 0;

    let inicioRacha = null;

 

    let maximoConsecutivos = 0;

    let inicioMaximo = null;

    let finMaximo = null;

 

    for (const fecha of todasLasFechas) {

      const asignacion = asignaciones.get(

        claveAsignacion(empleado.id, fecha)

      );

 

      if (esTurno(asignacion?.valor)) {

        if (rachaActual === 0) {

          inicioRacha = fecha;

        }

 

        rachaActual++;

 

        if (rachaActual > maximoConsecutivos) {

          maximoConsecutivos = rachaActual;

          inicioMaximo = inicioRacha;

          finMaximo = fecha;

        }

      } else {

        rachaActual = 0;

        inicioRacha = null;

      }

    }

 

    if (maximoConsecutivos >= 6) {

      let nivel = "PREVENTIVA";

      let mensaje = "El empleado tiene 6 días consecutivos trabajando.";

 

      if (maximoConsecutivos === 7) {

        nivel = "INFORMATIVA";

        mensaje = "El empleado tiene 7 días consecutivos trabajando.";

      }

 

      if (maximoConsecutivos >= 8) {

        nivel = "CRITICA";

        mensaje = `El empleado tiene ${maximoConsecutivos} días consecutivos trabajando.`;

      }

 

      alertas.push({

        empleadoId: empleado.id,

        empleado: `${empleado.nombres} ${empleado.apellidos}`,

        nivel,

        diasConsecutivos: maximoConsecutivos,

        fechaInicio: inicioMaximo,

        fechaFin: finMaximo,

        mensaje,

      });

    }

  }

 

  // --------------------------------------------------

  // FASE 5: DEVOLVER VISTA PREVIA

  // --------------------------------------------------

 

  return {

    mes,

    modo,

    empleados: empleados.length,

    totalDias: dias.length,

    totalAsignaciones: propuestas.length,

    conflictos,

    alertas,

    alertasCobertura,

    propuestas,

  };

}