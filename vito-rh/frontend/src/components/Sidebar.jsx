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
  FaWrench, // <-- ¡Aquí estaba el truco! Ya lo agregamos
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
  { nombre: "Mantenimiento", ruta: "/mantenimiento", icono: <FaWrench />, detalle: "Gestión y soporte" },
];

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <img
          src="/vita.jpeg"
          alt="Logo Vito Pizzería"
          style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8 }}
        />
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
    </aside>
  );
}