import { useEffect, useState } from "react";
import "./Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
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
} from "react-icons/fa";

// Lista completa conectada con los identificadores (IDs) de módulos
const menuItems = [
  { nombre: "Dashboard", ruta: "/dashboard", rutaChef: "/chef/dashboard", icono: <FaHome />, detalle: "", permiso: "dashboard" },
  { nombre: "Empleados", ruta: "/empleados", rutaChef: "/chef/empleados", icono: <FaUsers />, detalle: "Gestión de personal", permiso: "empleados" },
  { nombre: "Usuarios y Roles", ruta: "/usuarios", rutaChef: null, icono: <FaUserShield />, detalle: "Accesos y permisos", permiso: "usuarios" },
  { nombre: "Calendarios", ruta: "/horarios", rutaChef: "/chef/horarios", icono: <FaCalendarAlt />, detalle: "Turnos y periodos", permiso: "calendarios" },
  { nombre: "Reportes", ruta: "/reportes", rutaChef: "/chef/reportes", icono: <FaFileAlt />, detalle: "Incidencias y nóminas", permiso: "reportes" },
  { nombre: "Solicitudes", ruta: "/solicitudes", rutaChef: "/chef/solicitudes", icono: <FaUmbrellaBeach />, detalle: "Vacaciones y permisos", permiso: "solicitudes" },
  { nombre: "Reclutamiento", ruta: "/reclutamiento", rutaChef: "/chef/reclutamiento", icono: <FaUserTie />, detalle: "Selección de personal", permiso: "reclutamiento" },
  { nombre: "Planillas", ruta: "/planillas", rutaChef: "/chef/planillas", icono: <FaMoneyBillWave />, detalle: "Pagos y deducciones", permiso: "planillas" },
  { nombre: "Historial", ruta: "/bitacora", rutaChef: "/chef/bitacora", icono: <FaHistory />, detalle: "Registro de actividad", permiso: "bitacora" },
  { nombre: "Mantenimiento", ruta: "/mantenimiento", rutaChef: "/chef/mantenimiento", icono: <FaWrench />, detalle: "Gestión y soporte", permiso: "mantenimiento" },
];

function normalizarPermiso(clave) {
  const limpio = (clave || "").toLowerCase().trim();
  if (limpio === "horarios" || limpio === "calendario" || limpio === "calendarios") {
    return "calendarios";
  }
  if (limpio === "historial" || limpio === "bitacora") {
    return "bitacora";
  }
  return limpio;
}

function obtenerPermisosChefActivos() {
  // Prioriza la lista guardada explícitamente para el rol Chef (ID 4)
  const rawRolChef = localStorage.getItem("permisos_rol_4");
  if (rawRolChef !== null) {
    try {
      const parsed = JSON.parse(rawRolChef);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizarPermiso);
      }
    } catch (e) {
      console.error("Error parseando permisos_rol_4:", e);
    }
  }

  // Respaldo: permisos almacenados en el objeto usuario
  try {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (Array.isArray(usuarioLogueado.permisos)) {
      return usuarioLogueado.permisos.map(normalizarPermiso);
    }
  } catch (e) {
    console.error("Error parseando usuario en Sidebar:", e);
  }

  return [];
}

export default function Sidebar() {
  const location = useLocation();
  const esChef = location.pathname.startsWith("/chef");
  const [permisosChef, setPermisosChef] = useState(() => obtenerPermisosChefActivos());

  useEffect(() => {
    const actualizarPermisos = () => {
      setPermisosChef(obtenerPermisosChefActivos());
    };

    actualizarPermisos();
    window.addEventListener("storage", actualizarPermisos);
    window.addEventListener("permisosActualizados", actualizarPermisos);

    return () => {
      window.removeEventListener("storage", actualizarPermisos);
      window.removeEventListener("permisosActualizados", actualizarPermisos);
    };
  }, [location.pathname]);

  const menuFiltrado = menuItems.filter((item) => {
    if (!esChef) return true;
    if (!item.rutaChef) return false;

    const claveItem = normalizarPermiso(item.permiso);
    if (claveItem === "dashboard") return true;
    return permisosChef.includes(claveItem);
  });

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

      <div className="sidebar-section-label">
        {esChef ? "PANEL DEL CHEF" : "PANEL ADMINISTRADOR"}
      </div>

      <nav className="sidebar-menu">
        {menuFiltrado.map((item) => {
          const destino = esChef ? item.rutaChef : item.ruta;
          return (
            <NavLink
              key={destino}
              to={destino}
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
          );
        })}
      </nav>
    </aside>
  );
}