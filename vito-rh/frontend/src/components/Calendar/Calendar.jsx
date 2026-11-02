
import { useEffect, useMemo, useState } from "react";
import { Card, Alert, Spinner, Form } from "react-bootstrap";

import api from "../../services/api";
import "./Calendar.css";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const TURNOS = {
  T12_20: {
    texto: "12–8",
    clase: "turno-1",
    descripcion: "12:00 p. m. – 8:00 p. m.",
  },
  T12_22: {
    texto: "12–10",
    clase: "turno-2",
    descripcion: "12:00 p. m. – 10:00 p. m.",
  },
};

function fechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function inicioSemana(fecha) {
  const resultado = new Date(fecha);
  resultado.setHours(12, 0, 0, 0);

  const diferencia = (resultado.getDay() + 6) % 7;
  resultado.setDate(resultado.getDate() - diferencia);

  return resultado;
}

function nombreEmpleado(empleado) {
  return `${empleado.nombres ?? ""} ${empleado.apellidos ?? ""}`.trim();
}

function fechaHorario(horario) {
  const valor = horario.fechaInicio;
  if (!valor) return "";

  return String(valor).slice(0, 10);
}

export default function Calendar() {
  const [semana, setSemana] = useState(() => inicioSemana(new Date()));
  const [horarios, setHorarios] = useState([]);
  const [descansos, setDescansos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState("");
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("");

  // Estados del generador mensual
  const [mesPlanificacion, setMesPlanificacion] = useState(() => {
    const ahora = new Date();

    return `${ahora.getFullYear()}-${String(
      ahora.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const [modoPlanificacion, setModoPlanificacion] = useState("completar");
  const [generando, setGenerando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [guardandoPlanificacion, setGuardandoPlanificacion] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const dias = useMemo(
    () =>
      Array.from({ length: 7 }, (_, indice) => {
        const fecha = new Date(semana);
        fecha.setDate(semana.getDate() + indice);
        return fecha;
      }),
    [semana]
  );

  const fechaInicio = fechaISO(dias[0]);
  const fechaFin = fechaISO(dias[6]);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [
        respuestaHorarios,
        respuestaEmpleados,
        respuestaDescansos,
      ] = await Promise.all([
        api.get("/horarios"),
        api.get("/empleados"),
        api.get("/descansos", {
          params: { fechaInicio, fechaFin },
        }),
      ]);

      const listaEmpleados = Array.isArray(respuestaEmpleados.data)
        ? respuestaEmpleados.data
        : respuestaEmpleados.data?.empleados;

      if (!Array.isArray(respuestaHorarios.data)) {
        throw new Error("La API devolvió un formato de horarios inesperado.");
      }

      if (!Array.isArray(listaEmpleados)) {
        throw new Error("La API de empleados devolvió un formato inesperado.");
      }

      if (!Array.isArray(respuestaDescansos.data)) {
        throw new Error("La API de descansos devolvió un formato inesperado.");
      }

      setHorarios(respuestaHorarios.data);

      setEmpleados(
        listaEmpleados.filter((empleado) => empleado.estado === "ACTIVO")
      );

      setDescansos(respuestaDescansos.data);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          "No se pudo cargar la planificación semanal."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [fechaInicio, fechaFin]);

  function buscarHorario(empleadoId, fecha) {
    return horarios.find(
      (horario) =>
        Number(horario.empleadoId) === Number(empleadoId) &&
        fechaHorario(horario) === fecha &&
        horario.estado !== "MODIFICADO"
    );
  }

  function tieneDescanso(empleadoId, fecha) {
    return descansos.some(
      (descanso) =>
        Number(descanso.empleadoId) === Number(empleadoId) &&
        String(descanso.fecha).slice(0, 10) === fecha
    );
  }

  async function cambiarAsignacion(empleado, fecha, valor) {
    const clave = `${empleado.id}-${fecha}`;

    if (guardando || guardandoPlanificacion) return;

    try {
      setGuardando(clave);
      setError("");
      setMensajeExito("");

      await api.put("/horarios/asignacion", {
        empleadoId: empleado.id,
        fecha,
        valor,
      });

      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          "No se pudo guardar la asignación."
      );

      await cargarDatos();
    } finally {
      setGuardando("");
    }
  }

  // Generar la vista previa mensual
  async function generarPlanificacion() {
    try {
      setGenerando(true);
      setError("");
      setMensajeExito("");
      setVistaPrevia(null);

      const respuesta = await api.post("/horarios/generar", {
        mes: mesPlanificacion,
        modo: modoPlanificacion,
      });

      setVistaPrevia(respuesta.data);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          "No se pudo generar la planificación."
      );
    } finally {
      setGenerando(false);
    }
  }

  // Confirmar y guardar la planificación
  async function confirmarPlanificacion() {
    if (!vistaPrevia || guardandoPlanificacion) return;

    if (vistaPrevia.conflictos?.length > 0) {
      setError("No se puede guardar porque existen conflictos.");
      return;
    }

    const esReemplazo = modoPlanificacion === "reemplazar";

    const mensaje = esReemplazo
      ? `¿Estás seguro de reemplazar toda la planificación de ${mesPlanificacion}?\n\nSe eliminarán los horarios y descansos existentes de ese mes y se guardará la nueva propuesta.`
      : `¿Confirmás guardar los días pendientes de ${mesPlanificacion}?\n\nLas asignaciones existentes se conservarán.`;

    if (!window.confirm(mensaje)) return;

    try {
      setGuardandoPlanificacion(true);
      setError("");
      setMensajeExito("");

      const respuesta = await api.post("/horarios/guardar", {
        mes: mesPlanificacion,
        modo: modoPlanificacion,
      });

      setMensajeExito(
        respuesta.data.mensaje ||
          "La planificación se guardó correctamente."
      );

      setVistaPrevia(null);

      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          "No se pudo guardar la planificación."
      );
    } finally {
      setGuardandoPlanificacion(false);
    }
  }

  const empleadosFiltrados = empleados.filter((empleado) =>
    nombreEmpleado(empleado).toLowerCase().includes(filtro.toLowerCase())
  );

  const alertas = vistaPrevia?.alertas ?? [];
  const conflictos = vistaPrevia?.conflictos ?? [];
  const alertasCobertura = vistaPrevia?.alertasCobertura ?? [];

  const cantidadPreventivas = alertas.filter(
    (a) => a.nivel === "PREVENTIVA"
  ).length;

  const cantidadInformativas = alertas.filter(
    (a) => a.nivel === "INFORMATIVA"
  ).length;

  const cantidadCriticas = alertas.filter(
    (a) => a.nivel === "CRITICA"
  ).length;


  
  return (
    <Card className="shadow-sm weekly-calendar">
      <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h3 className="mb-1">Planificación de horarios</h3>

          <div className="text-muted small">
            Asignación semanal por empleado
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() =>
              setSemana((actual) => {
                const nueva = new Date(actual);
                nueva.setDate(nueva.getDate() - 7);
                return nueva;
              })
            }
          >
            ← Semana anterior
          </button>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setSemana(inicioSemana(new Date()))}
          >
            Hoy
          </button>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() =>
              setSemana((actual) => {
                const nueva = new Date(actual);
                nueva.setDate(nueva.getDate() + 7);
                return nueva;
              })
            }
          >
            Semana siguiente →
          </button>
          
        </div>
      </Card.Header>

      <Card.Body>
        {/* MENSAJES */}
        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {mensajeExito && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setMensajeExito("")}
          >
            {mensajeExito}
          </Alert>
        )}

        {/* ENCABEZADO DEL CALENDARIO SEMANAL */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
          <h5 className="mb-0">
            {dias[0].toLocaleDateString("es-HN", {
              day: "numeric",
              month: "short",
            })}{" "}
            –{" "}
            {dias[6].toLocaleDateString("es-HN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </h5>

          <Form.Control
            type="search"
            placeholder="Buscar empleado..."
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
            style={{ maxWidth: "280px" }}
          />
        </div>

        {/* LEYENDA */}
        <div className="d-flex flex-wrap gap-3 mb-3 small">
          <span>
            <span className="legend-dot turno-1" /> Turno 1: 12–8
          </span>

          <span>
            <span className="legend-dot turno-2" /> Turno 2: 12–10
          </span>

          <span>
            <span className="legend-dot descanso" /> Descanso
          </span>

          <span>
            <span className="legend-dot sin-asignar" /> Sin asignar
          </span>
        </div>

        {/* CALENDARIO */}
        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" className="me-2" />
            Cargando planificación...
          </div>
        ) : (
          <div className="weekly-table-wrapper">
            <table className="table table-bordered weekly-table align-middle">
              <thead>
                <tr>
                  <th className="employee-column">Empleado</th>

                  {dias.map((dia) => (
                    <th key={fechaISO(dia)} className="text-center">
                      <div>{DIAS_SEMANA[(dia.getDay() + 6) % 7]}</div>
                      <div>{dia.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id}>
                    <th className="employee-column">
                      <div>{nombreEmpleado(empleado)}</div>

                      <small className="text-muted">
                        {empleado.area?.nombre ??
                          empleado.puesto?.nombre ??
                          ""}
                      </small>
                    </th>

                    {dias.map((dia) => {
                      const fecha = fechaISO(dia);
                      const horario = buscarHorario(empleado.id, fecha);
                      const descanso = tieneDescanso(empleado.id, fecha);

                      const valor = descanso
                        ? "DESCANSO"
                        : horario?.turno ?? "SIN_ASIGNAR";

                      const turno = TURNOS[valor];
                      const clave = `${empleado.id}-${fecha}`;

                      return (
                        <td key={fecha} className="weekly-cell">
                          <select
                            className={`form-select form-select-sm assignment-select ${
                              turno?.clase ??
                              (valor === "DESCANSO"
                                ? "descanso"
                                : "sin-asignar")
                            }`}
                            aria-label={`${nombreEmpleado(empleado)}, ${fecha}`}
                            value={valor}
                            disabled={
                              guardando !== "" ||
                              guardandoPlanificacion
                            }
                            onChange={(event) =>
                              cambiarAsignacion(
                                empleado,
                                fecha,
                                event.target.value
                              )
                            }
                          >
                            <option value="SIN_ASIGNAR">
                              Sin asignar
                            </option>

                            <option value="T12_20">
                              Turno 1 (12–8)
                            </option>

                            <option value="T12_22">
                              Turno 2 (12–10)
                            </option>

                            <option value="DESCANSO">
                              Descanso
                            </option>
                          </select>

                          {guardando === clave && (
                            <Spinner
                              animation="border"
                              size="sm"
                              className="mt-1"
                              role="status"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {empleadosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center text-muted py-4"
                    >
                      No hay empleados activos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

{/* VERSIÓN PARA EXPORTAR A PDF */}
        {/* ACCIONES DEL CALENDARIO */}
        <div className="calendar-bottom-actions d-flex justify-content-end mt-3 mb-4">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => window.print()}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Exportar PDF
          </button>
        </div>

<div className="weekly-calendar-print">
  <div className="print-header">
    <div>
      <h2>VITO PIZZERÍA</h2>
      <p>Gestión de Recursos Humanos</p>
    </div>

    <div className="print-document-label">
      PLANIFICACIÓN DE HORARIOS
    </div>
  </div>

  <h3>Calendario de Turnos</h3>

  <p className="print-period">
    Período: {dias[0].toLocaleDateString("es-HN")} –{" "}
    {dias[6].toLocaleDateString("es-HN")}
  </p>

  <table className="print-calendar-table">
    <thead>
      <tr>
        <th>Empleado</th>

        {dias.map((dia) => (
          <th key={fechaISO(dia)}>
            {DIAS_SEMANA[(dia.getDay() + 6) % 7]}
            <br />
            {dia.getDate()}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {empleadosFiltrados.map((empleado) => (
        <tr key={empleado.id}>
          <td className="print-employee">
            <strong>{nombreEmpleado(empleado)}</strong>
            <small>
              {empleado.area?.nombre ??
                empleado.puesto?.nombre ??
                ""}
            </small>
          </td>

          {dias.map((dia) => {
            const fecha = fechaISO(dia);
            const horario = buscarHorario(empleado.id, fecha);
            const descanso = tieneDescanso(empleado.id, fecha);

            const valor = descanso
              ? "DESCANSO"
              : horario?.turno ?? "SIN_ASIGNAR";

            const informacion = {
              T12_20: {
                nombre: "Turno 1",
                hora: "12:00 – 20:00",
                clase: "print-turno-1",
              },
              T12_22: {
                nombre: "Turno 2",
                hora: "12:00 – 22:00",
                clase: "print-turno-2",
              },
              DESCANSO: {
                nombre: "Descanso",
                hora: "OFF",
                clase: "print-descanso",
              },
              SIN_ASIGNAR: {
                nombre: "Sin asignar",
                hora: "Pendiente",
                clase: "print-sin-asignar",
              },
            };

            const asignacion = informacion[valor];

            return (
              <td key={fecha}>
                <div className={asignacion.clase}>
                  <strong>{asignacion.nombre}</strong>
                  <small>{asignacion.hora}</small>
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>

  <div className="print-legend">
    <span>🟨 Turno 1: 12:00–20:00</span>
    <span>🟥 Turno 2: 12:00–22:00</span>
    <span>⬜ Descanso: OFF</span>
  </div>

  <div className="print-footer">
    Documento generado por Vito RH · Uso interno
  </div>
</div>

        {/* GENERADOR MENSUAL */}
        <div className="planning-generator mb-4">
          <h5 className="mb-3">Generación inteligente de horarios</h5>

          <div className="d-flex flex-wrap align-items-end gap-3">
            <Form.Group>
              <Form.Label>Mes de planificación</Form.Label>

              <Form.Control
                type="month"
                value={mesPlanificacion}
                onChange={(e) => {
                  setMesPlanificacion(e.target.value);
                  setVistaPrevia(null);
                  setMensajeExito("");
                }}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Tipo de generación</Form.Label>

              <Form.Select
                value={modoPlanificacion}
                onChange={(e) => {
                  setModoPlanificacion(e.target.value);
                  setVistaPrevia(null);
                  setMensajeExito("");
                }}
              >
                <option value="completar">
                  Completar días pendientes
                </option>

                <option value="reemplazar">
                  Reemplazar todo el mes
                </option>
              </Form.Select>
            </Form.Group>

            <button
              type="button"
              className="btn btn-primary"
              onClick={generarPlanificacion}
              disabled={
                generando ||
                guardandoPlanificacion ||
                !mesPlanificacion
              }
            >
              {generando ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Generando...
                </>
              ) : (
                "Generar vista previa"
              )}
            </button>
          </div>

          {/* VISTA PREVIA */}
          {vistaPrevia && (
            <div className="mt-4">
              <Alert variant="success">
                <strong>Vista previa generada correctamente.</strong>

                <div>
                  Empleados: {vistaPrevia.empleados} | Días:{" "}
                  {vistaPrevia.totalDias} | Asignaciones:{" "}
                  {vistaPrevia.totalAsignaciones}
                </div>
              </Alert>

              {/* RESUMEN DE ALERTAS */}
              <div className="planning-alert-summary mb-3">
                <h6>Resumen de alertas</h6>

                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-warning text-dark">
                    Preventivas: {cantidadPreventivas}
                  </span>

                  <span className="badge bg-info text-dark">
                    Informativas: {cantidadInformativas}
                  </span>

                  <span className="badge bg-danger">
                    Críticas: {cantidadCriticas}
                  </span>

                  <span className="badge bg-secondary">
                    Conflictos: {conflictos.length}
                  </span>
                </div>
              </div>

              {/* DETALLE DE ALERTAS */}
              {alertas.length > 0 && (
                <>
                  <h6>Detalle de jornadas consecutivas</h6>

                  <div className="table-responsive">
                    <table className="table table-sm table-bordered align-middle">
                      <thead>
                        <tr>
                          <th>Empleado</th>
                          <th>Días consecutivos</th>
                          <th>Desde</th>
                          <th>Hasta</th>
                          <th>Nivel</th>
                        </tr>
                      </thead>

                      <tbody>
                        {alertas.map((alerta, indice) => (
                          <tr key={`${alerta.empleadoId}-${indice}`}>
                            <td>{alerta.empleado}</td>

                            <td>{alerta.diasConsecutivos}</td>

                            <td>{alerta.fechaInicio}</td>

                            <td>{alerta.fechaFin}</td>

                            <td>
                              <span
                                className={`badge ${
                                  alerta.nivel === "CRITICA"
                                    ? "bg-danger"
                                    : alerta.nivel === "INFORMATIVA"
                                      ? "bg-info text-dark"
                                      : "bg-warning text-dark"
                                }`}
                              >
                                {alerta.nivel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* CONFLICTOS */}
              {conflictos.length > 0 && (
                <Alert variant="danger">
                  <strong>Conflictos detectados:</strong>

                  <ul className="mb-0 mt-2">
                    {conflictos.map((conflicto, indice) => (
                      <li key={indice}>
                        {conflicto.empleado}: {conflicto.mensaje}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {/* BOTONES DE CONFIRMACIÓN */}
              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={guardandoPlanificacion}
                  onClick={() => setVistaPrevia(null)}
                >
                  Cancelar vista previa
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  disabled={
                    guardandoPlanificacion ||
                    conflictos.length > 0
                  }
                  onClick={confirmarPlanificacion}
                >
                  {guardandoPlanificacion ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Guardando planificación...
                    </>
                  ) : (
                    "Confirmar y guardar planificación"
                  )}
                </button>
              </div>

              {conflictos.length === 0 && (
                <small className="text-muted d-block mt-2 text-end">
                  Las alertas son informativas y no impiden guardar.
                </small>
              )}
            </div>
          )}
        </div>


      </Card.Body>
    </Card>
  );
}
