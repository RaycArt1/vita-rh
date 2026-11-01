import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaFolderOpen,
} from "react-icons/fa";

export default function Sidebar() {
  const menu = [
    {
      nombre: "Dashboard",
      ruta: "/dashboard",
      icono: <FaHome />,
    },
    {
      nombre: "Empleados",
      ruta: "/empleados",
      icono: <FaUsers />,
    },
    {
      nombre: "Horarios",
      ruta: "/horarios",
      icono: <FaCalendarAlt />,
    },
    {
      nombre: "Vacaciones",
      ruta: "/vacaciones",
      icono: <FaUmbrellaBeach />,
    },
    {
      nombre: "Expedientes",
      ruta: "/expedientes",
      icono: <FaFolderOpen />,
    },
  ];

  return (
    <div
      className="bg-dark text-white"
      style={{
        width: "250px",
        minHeight: "100vh",
      }}
    >
      <h2 className="text-center py-4 fw-bold">
        Vita RH
      </h2>

      <div className="nav flex-column">

        {menu.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            className={({ isActive }) =>
              `nav-link text-white py-3 px-4 ${
                isActive ? "bg-danger" : ""
              }`
            }
          >
            <span className="me-3">
              {item.icono}
            </span>

            {item.nombre}
          </NavLink>
        ))}

      </div>
    </div>
  );
}