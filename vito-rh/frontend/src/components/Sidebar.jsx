import "./Sidebar.css";

import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaFolderOpen,
  FaUserShield,
  FaHistory,
  FaFileAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaSignOutAlt,
} from "react-icons/fa";

const menu = [
  { nombre: "Dashboard", ruta: "/dashboard", icono: <FaHome />, detalle: "" },
  { nombre: "Empleados", ruta: "/empleados", icono: <FaUsers />, detalle: "Gestión de personal" },
  { nombre: "Usuarios y Roles", ruta: "/usuarios", icono: <FaUserShield />, detalle: "Accesos y permisos" },
  { nombre: "Calendarios", ruta: "/horarios", icono: <FaCalendarAlt />, detalle: "Turnos y periodos" },
  { nombre: "Reportes", ruta: "/reportes", icono: <FaFileAlt />, detalle: "Incidencias y nóminas" },
  { nombre: "Vacaciones", ruta: "/vacaciones", icono: <FaUmbrellaBeach />, detalle: "Permisos y ausencias" },
  { nombre: "Reclutamiento", ruta: "/reclutamiento", icono: <FaUserTie />, detalle: "Selección de personal" },
  { nombre: "Planillas", ruta: "/planillas", icono: <FaMoneyBillWave />, detalle: "Pagos y deducciones" },
  { nombre: "Historial", ruta: "/historial", icono: <FaHistory />, detalle: "Registro de actividad" },
];

export default function Sidebar() {
  function cerrarSesion() {
    sessionStorage.removeItem("gestRH_token");
    sessionStorage.removeItem("gestRH_usuario");
    window.location.assign("/login");
  }

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">VH</div>
        <div className="sidebar-brand-text">
          <strong>GestRH</strong>
          <span>Vito Pizzería</span>
        </div>
      </div>

      <div className="sidebar-section-label">PANEL ADMINISTRADOR</div>

      <nav className="sidebar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{item.icono}</span>
            <span className="sidebar-link-copy">
              <strong>{item.nombre}</strong>
              {item.detalle && <small>{item.detalle}</small>}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">AV</div>
          <div className="sidebar-profile-copy">
            <strong>Administrador Vito</strong>
            <span>Administrador</span>
          </div>
          <button
            type="button"
            className="sidebar-logout-icon"
            onClick={cerrarSesion}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <FaSignOutAlt />
          </button>
        </div>

        <button
          type="button"
          className="sidebar-logout-text"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
