import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import { Alert, Card, Col, Row, Spinner } from "react-bootstrap";
import {
  FaUsers,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaUserTie,
  FaFolderOpen,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaMoneyBillWave,
} from "react-icons/fa";
import "./Dashboard.css";

function fechaCompleta(valor) {
  if (!valor) return "";
  return new Date(valor).toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fechaCorta(valor) {
  if (!valor) return { dia: "", numero: "" };

  const fecha = new Date(valor);
  return {
    dia: fecha.toLocaleDateString("es-HN", { weekday: "short" }),
    numero: fecha.toLocaleDateString("es-HN", { day: "numeric" }),
  };
}

function tiempoRelativo(valor) {
  if (!valor) return "";

  const fecha = new Date(valor);
  const diferencia = Date.now() - fecha.getTime();

  if (Number.isNaN(fecha.getTime())) return "";

  const minutos = Math.floor(diferencia / 60000);
  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

function iniciales(nombre = "") {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

function colorActividad(indice) {
  return ["rosa", "rojo", "verde", "amarillo"][indice % 4];
}

function claseEvento(tipo) {
  if (tipo === "ENTREVISTA") return "vino";
  if (tipo === "VACACIONES") return "verde";
  return "naranja";
}

function StatDashboard({ titulo, valor, icono, color, detalle }) {
  return (
    <Card className={`dashboard-stat-card stat-${color} h-100`}>
      <Card.Body>
        <div className="stat-card-top">
          <span className={`stat-icon stat-icon-${color}`}>{icono}</span>
          <span className={`stat-detail stat-detail-${color}`}>{detalle}</span>
        </div>
        <div className="stat-value">{valor ?? 0}</div>
        <div className="stat-title">{titulo}</div>
      </Card.Body>
    </Card>
  );
}

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDashboard() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await api.get("/dashboard");

        if (activo) setDatos(respuesta.data);
      } catch (err) {
        if (activo) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo conectar con el servidor para cargar el dashboard."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDashboard();

    return () => {
      activo = false;
    };
  }, []);

  const tarjetas = datos?.tarjetas ?? {};
  const metricas = datos?.metricas ?? {};
  const actividad = datos?.actividad ?? [];
  const eventos = datos?.eventos ?? [];

  return (
    <MainLayout>
      <div className="dashboard-page">
        <div className="dashboard-heading">
          <p>{fechaCompleta(new Date())} — Vito Pizzería</p>
          <h1>Panel Principal</h1>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {cargando ? (
          <div className="dashboard-loading">
            <Spinner animation="border" role="status" />
            <span>Cargando información real del sistema...</span>
          </div>
        ) : (
          <>
            <Row className="g-3 dashboard-stats">
              <Col xs={12} sm={6} xl={3}>
                <StatDashboard
                  titulo="Empleados activos"
                  valor={tarjetas.empleadosActivos}
                  icono={<FaUsers />}
                  color="primary"
                  detalle="Personal activo"
                />
              </Col>

              <Col xs={12} sm={6} xl={3}>
                <StatDashboard
                  titulo="Vacaciones pendientes"
                  valor={tarjetas.vacacionesPendientes}
                  icono={<FaUmbrellaBeach />}
                  color="warning"
                  detalle="Por aprobar"
                />
              </Col>

              <Col xs={12} sm={6} xl={3}>
                <StatDashboard
                  titulo="Turnos esta semana"
                  valor={tarjetas.turnosSemana}
                  icono={<FaCalendarAlt />}
                  color="success"
                  detalle="Semana actual"
                />
              </Col>

              <Col xs={12} sm={6} xl={3}>
                <StatDashboard
                  titulo="Candidatos activos"
                  valor={tarjetas.candidatosEnProceso}
                  icono={<FaUserTie />}
                  color="danger"
                  detalle="En proceso"
                />
              </Col>
            </Row>

            <div className="dashboard-content-grid">
              <section className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h2>Actividad reciente</h2>
                  <span className="dashboard-live-badge">Datos del sistema</span>
                </div>

                {actividad.length > 0 ? (
                  <div>
                    {actividad.map((item, indice) => (
                      <div className="activity-item" key={item.id}>
                        <div className={`activity-avatar ${colorActividad(indice)}`}>
                          {iniciales(item.usuario)}
                        </div>

                        <div className="activity-description">
                          <h3>{item.usuario}</h3>
                          <p>{item.descripcion}</p>
                        </div>

                        <span className="activity-time">
                          {tiempoRelativo(item.fecha)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty">
                    Todavía no hay movimientos registrados en la bitácora.
                  </div>
                )}
              </section>

              <div className="dashboard-right-column">
                <section className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <h2>Próximos eventos</h2>
                  </div>

                  {eventos.length > 0 ? (
                    <div className="event-list">
                      {eventos.map((evento) => {
                        const fecha = fechaCorta(evento.fecha);
                        const clase = claseEvento(evento.tipo);

                        return (
                          <div className="event-item" key={evento.id}>
                            <div className={`event-date ${clase}`}>
                              <span>{fecha.dia}</span>
                              <strong>{fecha.numero}</strong>
                            </div>

                            <div className="event-description">
                              <span className={`event-type ${clase}`}>
                                {evento.titulo}
                              </span>
                              <p>{evento.descripcion}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="dashboard-empty">
                      No hay entrevistas, vacaciones ni pagos programados para los próximos 7 días.
                    </div>
                  )}
                </section>

                <section className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <h2>Métricas clave</h2>
                  </div>

                  <div className="metric-list">
                    <div className="metric-item">
                      <div>
                        <span>Reportes graves</span>
                        <strong>{metricas.reportesGraves ?? 0}</strong>
                      </div>
                      <span className="metric-change urgent">
                        <FaExclamationTriangle /> Graves
                      </span>
                    </div>

                    <div className="metric-item">
                      <div>
                        <span>Reportes moderados</span>
                        <strong>{metricas.reportesModerados ?? 0}</strong>
                      </div>
                      <span className="metric-change positive">
                        <FaFolderOpen /> Moderados
                      </span>
                    </div>

                    <div className="metric-item">
                      <div>
                        <span>Informativos / leves</span>
                        <strong>{metricas.reportesInformativosLeves ?? 0}</strong>
                      </div>
                      <span className="metric-change positive">
                        <FaCalendarCheck /> Informativos
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <p className="dashboard-disclaimer">
              Información obtenida de los registros actuales de Vito RH.
              {datos?.actualizadoEn
                ? ` Actualizado: ${new Date(datos.actualizadoEn).toLocaleString("es-HN")}.`
                : ""}
            </p>
          </>
        )}
      </div>
    </MainLayout>
  );
}
