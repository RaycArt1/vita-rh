
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import { Row, Col } from "react-bootstrap";
import {
  FaUsers,
  FaUmbrellaBeach,
  FaClock,
  FaUserTie,
  FaRegCalendarAlt,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaExclamationCircle,
} from "react-icons/fa";
import "./Dashboard.css";

const actividades = [
  {
    iniciales: "JP",
    nombre: "Juan Pérez",
    descripcion: "Solicitó vacaciones del 12 al 18 de agosto",
    tiempo: "hace 1 h",
    color: "rosa",
  },
  {
    iniciales: "CR",
    nombre: "Carlos Ruiz",
    descripcion: "Solicitó intercambio de turno con Luis Herrera",
    tiempo: "hace 2 h",
    color: "rojo",
  },
  {
    iniciales: "AT",
    nombre: "Ana Torres",
    descripcion: "Vacaciones aprobadas para el 20–24 de agosto",
    tiempo: "hace 3 h",
    color: "verde",
  },
  {
    iniciales: "RH",
    nombre: "RRHH",
    descripcion: "Nómina del mes de julio procesada y enviada",
    tiempo: "ayer",
    color: "rosa",
  },
  {
    iniciales: "JD",
    nombre: "Jorge Díaz",
    descripcion: "Incidencia por incumplimiento de uniforme registrada",
    tiempo: "ayer",
    color: "amarillo",
  },
];

const eventos = [
  {
    dia: "Hoy",
    tipo: "TURNO",
    descripcion: "Publicación del horario semanal — semana del 10 ago",
    color: "naranja",
    icono: <FaClock />,
  },
  {
    dia: "Mié 6",
    tipo: "RECLUTAMIENTO",
    descripcion: "Entrevista — Valentina Ríos",
    color: "vino",
    icono: <FaUsers />,
  },
  {
    dia: "Vie 8",
    tipo: "NÓMINA",
    descripcion: "Pago de nómina quincenal — corte agosto",
    color: "rojo",
    icono: <FaMoneyBillWave />,
  },
  {
    dia: "Lun 11",
    tipo: "VACACIONES",
    descripcion: "Reincorporación prevista de Ana Torres",
    color: "verde",
    icono: <FaUmbrellaBeach />,
  },
];

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="dashboard-page">
        <header className="dashboard-heading">
          <p>
  {new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())}{" "}
  — Vito Pizzería
</p>
          <h1>Panel Principal</h1>
        </header>

        <Row className="dashboard-stats g-3">
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              titulo="Total Empleados"
              valor="18"
              icono={<FaUsers />}
              color="primary"
              detalle="+1 este mes"
            />
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <StatCard
              titulo="Vacaciones Pendientes"
              valor="3"
              icono={<FaUmbrellaBeach />}
              color="warning"
              detalle="2 por aprobar"
            />
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <StatCard
              titulo="Turnos Semana"
              valor="38"
              icono={<FaClock />}
              color="success"
              detalle="1 intercambio"
            />
          </Col>

          <Col xs={12} sm={6} xl={3}>
            <StatCard
              titulo="Candidatos Activos"
              valor="5"
              icono={<FaUserTie />}
              color="danger"
              detalle="2 en entrevista"
            />
          </Col>
        </Row>

        <div className="dashboard-content-grid">
          <section className="dashboard-panel dashboard-activity">
            <div className="dashboard-panel-header">
              <h2>Actividad Reciente</h2>
              <span className="dashboard-live-badge">Demostración</span>
            </div>

            <div className="activity-list">
              {actividades.map((actividad) => (
                <article className="activity-item" key={actividad.iniciales + actividad.nombre}>
                  <div className={`activity-avatar ${actividad.color}`}>
                    {actividad.iniciales}
                  </div>

                  <div className="activity-description">
                    <h3>{actividad.nombre}</h3>
                    <p>{actividad.descripcion}</p>
                  </div>

                  <span className="activity-time">{actividad.tiempo}</span>
                </article>
              ))}
            </div>
          </section>

          <div className="dashboard-right-column">
            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2>Próximos Eventos</h2>
              </div>

              <div className="event-list">
                {eventos.map((evento) => (
                  <article className="event-item" key={evento.tipo}>
                    <div className={`event-date ${evento.color}`}>
                      {evento.dia}
                    </div>

                    <div className="event-description">
                      <span className={`event-type ${evento.color}`}>
                        {evento.tipo}
                      </span>
                      <p>{evento.descripcion}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel dashboard-metrics">
              <div className="dashboard-panel-header">
                <h2>Métricas Clave</h2>
              </div>

              <div className="metric-list">
                <div className="metric-item">
                  <div>
                    <span>Rotación mensual</span>
                    <strong>1.8%</strong>
                  </div>
                  <span className="metric-change positive">↓ 0.5%</span>
                </div>

                <div className="metric-item">
                  <div>
                    <span>Asistencia promedio</span>
                    <strong>97.2%</strong>
                  </div>
                  <span className="metric-change positive">↑ 0.8%</span>
                </div>

                <div className="metric-item">
                  <div>
                    <span>Posiciones abiertas</span>
                    <strong>3</strong>
                  </div>
                  <span className="metric-change urgent">
                    <FaExclamationCircle /> 1 urgente
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <p className="dashboard-disclaimer">
          Vista de demostración: los indicadores, actividades y eventos son
          datos de ejemplo y no representan registros reales de la empresa.
        </p>
      </div>
    </MainLayout>
  );
}
