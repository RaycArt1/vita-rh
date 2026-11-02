
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

  const empleados = await prisma.empleado.findMany({
    where: { estado: "ACTIVO" },
    include: {
      area: true,
    },
    orderBy: [{ areaId: "asc" }, { nombres: "asc" }],
  });

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
  // FASE 1: DISTRIBUIR DESCANSOS SEGÚN CONTINUIDAD
  // --------------------------------------------------

  const todasLasFechas = [];

  for (
    let fecha = inicioConsulta;
    fecha <= fin;
    fecha = sumarDias(fecha, 1)
  ) {
    todasLasFechas.push(fechaTexto(fecha));
  }

  for (const fecha of todasLasFechas) {
    const perteneceAlMes = fecha >= dias[0] && fecha <= dias[dias.length - 1];

    const empleadosPorDescansar = [];

    for (const empleado of empleados) {
      const clave = claveAsignacion(empleado.id, fecha);
      const actual = asignaciones.get(clave);

      if (!perteneceAlMes) {
        // El historial anterior solo se consulta.
        if (actual?.valor === "DESCANSO") {
          consecutivos.set(empleado.id, 0);
        } else if (esTurno(actual?.valor)) {
          consecutivos.set(
            empleado.id,
            consecutivos.get(empleado.id) + 1
          );
        } else {
          consecutivos.set(empleado.id, 0);
        }

        continue;
      }

      // Si ya existe una asignación, se respeta.
      if (actual) {
        if (actual.valor === "DESCANSO") {
          consecutivos.set(empleado.id, 0);
        } else if (esTurno(actual.valor)) {
          const nuevoTotal =
            consecutivos.get(empleado.id) + 1;

          consecutivos.set(empleado.id, nuevoTotal);

          if (nuevoTotal > MAXIMO_CONSECUTIVOS) {
            const claveConflicto = `${empleado.id}_${fecha}`;

            if (!conflictosRegistrados.has(claveConflicto)) {
              conflictosRegistrados.add(claveConflicto);

              conflictos.push({
                empleadoId: empleado.id,
                empleado: `${empleado.nombres} ${empleado.apellidos}`,
                fecha,
                mensaje:
                  "Una asignación existente provoca más de 7 días consecutivos. Debe revisarse manualmente.",
              });
            }
          }
        }

        continue;
      }

      // Si no existe asignación y ya trabajó 6 días,
      // debe tener prioridad para descansar.
      if (consecutivos.get(empleado.id) >= 6) {
        empleadosPorDescansar.push(empleado);
      } else {
        // Marcamos temporalmente el turno pendiente.
        asignaciones.set(clave, {
          valor: "PENDIENTE_TURNO",
          origen: "generado",
        });

        consecutivos.set(
          empleado.id,
          consecutivos.get(empleado.id) + 1
        );
      }
    }

    // Distribuir los descansos cuando varios empleados
    // necesitan descansar el mismo día.
    empleadosPorDescansar.sort((a, b) => {
      const areaA = a.areaId ?? 0;
      const areaB = b.areaId ?? 0;

      if (areaA !== areaB) {
        return areaA - areaB;
      }

      return a.id - b.id;
    });

    const gruposArea = new Map();

    for (const empleado of empleadosPorDescansar) {
      const areaId = empleado.areaId ?? 0;

      if (!gruposArea.has(areaId)) {
        gruposArea.set(areaId, []);
      }

      gruposArea.get(areaId).push(empleado);
    }

    for (const grupo of gruposArea.values()) {
      grupo.forEach((empleado, indice) => {
        const clave = claveAsignacion(empleado.id, fecha);

        // Alternamos los descansos si varios empleados
        // de la misma área los necesitan simultáneamente.
        // Quienes continúen trabajando podrán llegar a 7,
        // pero nunca se les asignará un octavo día.
        if (indice % 2 === 0 || grupo.length === 1) {
          asignaciones.set(clave, {
            valor: "DESCANSO",
            origen: "generado",
          });

          consecutivos.set(empleado.id, 0);
        } else {
          asignaciones.set(clave, {
            valor: "PENDIENTE_TURNO",
            origen: "generado",
          });

          consecutivos.set(
            empleado.id,
            consecutivos.get(empleado.id) + 1
          );
        }
      });
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
