import {
  FaUtensils,
  FaClock,
  FaTachometerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaUserPlus,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import "./ChefDashboard.css";

const personal = [
  {
    iniciales: "LH",
    nombre: "Luis Herrera",
    puesto: "Pizzero",
    horario: "06:00–14:00",
    estado: "En turno",
    estiloAvatar: "",
  },
  {
    iniciales: "CR",
    nombre: "Carlos Ruiz",
    puesto: "Cocinero",
    horario: "14:00–22:00",
    estado: "Próximo turno",
    estiloAvatar: "avatar-verde",
  },
  {
    iniciales: "SM",
    nombre: "Sandra Mora",
    puesto: "Auxiliar de cocina",
    horario: "06:00–14:00",
    estado: "En turno",
    estiloAvatar: "avatar-ambar",
  },
];

const eventosCocina = [
  {
    id: 1,
    dia: "Mié",
    numero: "18",
    titulo: "Relevo turno de tarde",
    detalle: "Preparación de masa y estaciones — 14:00",
  },
  {
    id: 2,
    dia: "Jue",
    numero: "19",
    titulo: "Revisión de descansos",
    detalle: "Validación de cobertura en cocina",
  },
];

export default function ChefDashboard() {
  const fecha = new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const activosHoy = personal.length;
  const turnosEnCurso = personal.filter((p) => p.estado === "En turno").length;
  const ajustesPendientes = 0;

  return (
    <div className="chef-layout">
      <aside className="chef-sidebar">
        <div className="chef-brand">
          <div className="chef-logo">V</div>
          <div>
            <strong>GestRH</strong>
            <span>Vito Pizzería</span>
          </div>
        </div>

        <div className="chef-menu-title">PANEL DEL CHEF</div>

        <nav className="chef-menu">
          <a href="/chef/dashboard" className="chef-menu-item active">
            <FaTachometerAlt />
            <span>
              Dashboard
              <small>Resumen de cocina</small>
            </span>
          </a>

          <a href="/chef/horarios" className="chef-menu-item">
            <FaCalendarAlt />
            <span>
              Calendarios
              <small>Turnos y periodos</small>
            </span>
          </a>

          <a href="/chef/solicitudes" className="chef-menu-item">
            <FaFileAlt />
            <span>
              Solicitudes
              <small>Vacaciones y permisos</small>
            </span>
          </a>

          <a href="/chef/reclutamiento" className="chef-menu-item">
            <FaUserPlus />
            <span>
              Reclutamiento
              <small>Selección de personal</small>
            </span>
          </a>
        </nav>
      </aside>

      <main className="chef-main">
        <header className="chef-heading">
          <p>{fecha} — Vito Pizzería</p>
          <h1>Dashboard del Chef</h1>
        </header>

        <section className="chef-stats">
          <article className="chef-stat-card stat-rojo">
            <div className="chef-stat-top">
              <span className="chef-badge">Activos hoy</span>
              <span className="chef-stat-icon">
                <FaUtensils />
              </span>
            </div>
            <strong>{activosHoy}</strong>
            <p>Personal de cocina</p>
          </article>

          <article className="chef-stat-card stat-verde">
            <div className="chef-stat-top">
              <span className="chef-badge badge-verde">Cocina abierta</span>
              <span className="chef-stat-icon">
                <FaClock />
              </span>
            </div>
            <strong>{turnosEnCurso}</strong>
            <p>Turnos en curso</p>
          </article>

          <article className="chef-stat-card stat-ambar">
            <div className="chef-stat-top">
              <span className="chef-badge badge-ambar">Revisar en calendario</span>
              <span className="chef-stat-icon">
                <FaCalendarAlt />
              </span>
            </div>
            <strong>{ajustesPendientes}</strong>
            <p>Ajustes pendientes</p>
          </article>
        </section>

        <div className="chef-dashboard-grid">
          <section className="chef-team-card">
            <div className="chef-panel-header">
              <h2>
                <FaUtensils /> Equipo de cocina hoy
              </h2>
              <span className="chef-live-pill">Turno del día</span>
            </div>

            <div className="chef-team-list">
              {personal.map((empleado) => (
                <article
                  className="chef-team-member"
                  key={empleado.iniciales}
                >
                  <div className={`chef-avatar ${empleado.estiloAvatar}`}>
                    {empleado.iniciales}
                  </div>

                  <div className="chef-member-info">
                    <strong>{empleado.nombre}</strong>
                    <span>{empleado.puesto}</span>
                  </div>

                  <div className="chef-member-shift">
                    <span className="chef-shift-time">
                      <FaClock /> {empleado.horario}
                    </span>
                    <span
                      className={`chef-shift-status ${
                        empleado.estado === "En turno" ? "" : "proximo"
                      }`}
                    >
                      {empleado.estado}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="chef-side-stack">
            <section className="chef-panel-card">
              <div className="chef-panel-header">
                <h2>Próximos eventos</h2>
              </div>

              {eventosCocina.map((ev) => (
                <div className="chef-event-row" key={ev.id}>
                  <div className="chef-event-box">
                    <span>{ev.dia}</span>
                    <strong>{ev.numero}</strong>
                  </div>
                  <div className="chef-event-info">
                    <strong>{ev.titulo}</strong>
                    <span>{ev.detalle}</span>
                  </div>
                </div>
              ))}
            </section>

            <section className="chef-panel-card">
              <div className="chef-panel-header">
                <h2>Métricas clave</h2>
              </div>

              <div className="chef-metric-row">
                <div>
                  <span>Reportes graves</span>
                  <strong>0</strong>
                </div>
                <span className="chef-metric-pill grave">
                  <FaExclamationTriangle /> Graves
                </span>
              </div>

              <div className="chef-metric-row">
                <div>
                  <span>Reportes moderados</span>
                  <strong>0</strong>
                </div>
                <span className="chef-metric-pill moderado">
                  Moderados
                </span>
              </div>

              <div className="chef-metric-row">
                <div>
                  <span>Cobertura de cocina</span>
                  <strong>100%</strong>
                </div>
                <span className="chef-metric-pill ok">
                  <FaCheckCircle /> Activa
                </span>
              </div>
            </section>
          </div>
        </div>

        <p className="chef-disclaimer">
          Vista operativa de cocina — Vito RH · Vito Pizzería.
        </p>
      </main>
    </div>
  );
}