import "./Sidebar.css";

import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaUserShield,
  FaHistory,
  FaFileAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaWrench,
  FaUser,
} from "react-icons/fa";

const menuAdministrador = [
  { nombre: "Dashboard", ruta: "/dashboard", icono: <FaHome />, detalle: "" },
  { nombre: "Empleados", ruta: "/empleados", icono: <FaUsers />, detalle: "Gestión de personal" },
  { nombre: "Usuarios y Roles", ruta: "/usuarios", icono: <FaUserShield />, detalle: "Accesos y permisos" },
  { nombre: "Calendarios", ruta: "/horarios", icono: <FaCalendarAlt />, detalle: "Turnos y periodos" },
  { nombre: "Reportes", ruta: "/reportes", icono: <FaFileAlt />, detalle: "Incidencias y nóminas" },
  { nombre: "Solicitudes", ruta: "/solicitudes", icono: <FaUmbrellaBeach />, detalle: "Vacaciones y permisos" },
  { nombre: "Reclutamiento", ruta: "/reclutamiento", icono: <FaUserTie />, detalle: "Selección de personal" },
  { nombre: "Planillas", ruta: "/planillas", icono: <FaMoneyBillWave />, detalle: "Pagos y deducciones" },
  { nombre: "Historial", ruta: "/bitacora", icono: <FaHistory />, detalle: "Registro de actividad" },
  { nombre: "Mantenimiento", ruta: "/mantenimiento", icono: <FaWrench />, detalle: "Gestión y soporte" },
];

const menuEmpleado = [
  { nombre: "Mi resumen", ruta: "/resumen", icono: <FaHome />, detalle: "Mi información personal" },
  { nombre: "Mis horarios", ruta: "/mis-horarios", icono: <FaCalendarAlt />, detalle: "Turnos asignados" },
  { nombre: "Mis solicitudes", ruta: "/mis-solicitudes", icono: <FaUmbrellaBeach />, detalle: "Vacaciones y permisos" },
  { nombre: "Mis llamados", ruta: "/mis-llamados", icono: <FaFileAlt />, detalle: "Llamados de atención" },
  { nombre: "Mi perfil", ruta: "/mi-perfil", icono: <FaUser />, detalle: "Datos personales" },
];

function obtenerUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem("gestRH_usuario")) || {};
  } catch {
    return {};
  }
}

export default function Sidebar() {
  const usuario = obtenerUsuario();
  const esEmpleado = usuario.rol === "EMPLEADO";
  const menuVisible = esEmpleado ? menuEmpleado : menuAdministrador;
  const etiqueta = esEmpleado ? "PANEL EMPLEADO" : "PANEL ADMINISTRADOR";

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

      <div className="sidebar-section-label">{etiqueta}</div>

      <nav className="sidebar-menu">
        {menuVisible.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
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