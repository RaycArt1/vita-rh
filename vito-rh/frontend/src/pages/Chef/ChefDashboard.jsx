
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaHome,
} from "react-icons/fa";
import "./ChefDashboard.css";

const personal = [
  {
    iniciales: "LH",
    nombre: "Luis Herrera",
    puesto: "Pizzero",
    horario: "06:00–14:00",
    estado: "En turno",
  },
  {
    iniciales: "CR",
    nombre: "Carlos Ruiz",
    puesto: "Cocinero",
    horario: "14:00–22:00",
    estado: "Próximo turno",
  },
  {
    iniciales: "SM",
    nombre: "Sandra Mora",
    puesto: "Auxiliar de cocina",
    horario: "06:00–14:00",
    estado: "En turno",
  },
];

export default function ChefDashboard() {
  const fecha = new Intl.DateTimeFormat("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="chef-layout">
      <aside className="chef-sidebar">
        <div className="chef-brand">
          <div className="chef-logo">VH</div>
          <div>
            <strong>GestRH</strong>
            <span>Vito Pizzería</span>
          </div>
        </div>

        <p className="chef-menu-title">PANEL CHEF DE COCINA</p>

        <nav className="chef-menu">
          <Link
            to="/chef/dashboard"
            className="chef-menu-item active"
          >
            <FaHome />
            <span>Dashboard</span>
          </Link>

          <Link to="/chef/personal" className="chef-menu-item">
            <FaUsers />
            <span>
              Personal de cocina
              <small>Equipo del área</small>
            </span>
          </Link>

          <Link to="/chef/calendario" className="chef-menu-item">
            <FaCalendarAlt />
            <span>
              Calendario y cambios
              <small>Turnos y solicitudes</small>
            </span>
          </Link>
        </nav>
      </aside>

      <main className="chef-main">
        <header className="chef-heading">
          <p>{fecha} — Vito Pizzería</p>
          <h1>Dashboard del Chef</h1>
        </header>

        <section className="chef-stats">
          <article className="chef-stat-card">
            <span className="chef-badge">Activos hoy</span>
            <strong>3</strong>
            <p>Personal de cocina</p>
          </article>

          <article className="chef-stat-card">
            <span className="chef-badge">Cocina abierta</span>
            <strong>2</strong>
            <p>Turnos en curso</p>
          </article>

          <article className="chef-stat-card">
            <span className="chef-badge">Revisar en calendario</span>
            <strong>0</strong>
            <p>Ajustes pendientes</p>
          </article>
        </section>

        <section className="chef-team-card">
          <h2>
            <FaUtensils /> Equipo de cocina hoy
          </h2>

          <div className="chef-team-list">
            {personal.map((empleado) => (
              <article
                className="chef-team-member"
                key={empleado.iniciales}
              >
                <div className="chef-avatar">
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
                  <span className="chef-shift-status">
                    {empleado.estado}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="chef-disclaimer">
          Vista inicial de demostración. Los empleados, turnos y estadísticas
          se conectarán posteriormente con la base de datos.
        </p>
      </main>
    </div>
  );
}
