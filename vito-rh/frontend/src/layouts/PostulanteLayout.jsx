import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaBriefcase, FaFileSignature, FaUserCircle, FaClipboardCheck, FaSignOutAlt } from "react-icons/fa";
import "../pages/postulante/Postulante.css";

const enlaces = [
  { ruta: "/postulante/vacantes", texto: "Vacantes", subtitulo: "Oportunidades disponibles", icono: <FaBriefcase /> },
  { ruta: "/postulante/aplicar", texto: "Aplicar", subtitulo: "Nueva postulación", icono: <FaFileSignature /> },
  { ruta: "/postulante/mis-datos", texto: "Mis datos", subtitulo: "Foto y referencias", icono: <FaUserCircle /> },
  { ruta: "/postulante/mi-postulacion", texto: "Mi postulación", subtitulo: "Estado del proceso", icono: <FaClipboardCheck /> },
];

export default function PostulanteLayout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({});
  useEffect(() => {
    try { setUsuario(JSON.parse(sessionStorage.getItem("gestRH_usuario") || "{}")); }
    catch { setUsuario({}); }
  }, []);
  function cerrarSesion() {
    for (const key of ["gestRH_token", "gestRH_usuario", "token", "usuario"]) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    }
    navigate("/login", { replace: true });
  }
  const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ") || usuario.username || "Postulante";
  return (
    <div className="ps-shell">
      <aside className="ps-sidebar">
        <div className="ps-marca">
          <div className="ps-marca-icono">VH</div>
          <div><strong>GestRH</strong><small>Vita Pizzería</small></div>
        </div>
        <div className="ps-menu-titulo">PANEL POSTULANTE</div>
        <nav className="ps-menu" aria-label="Navegación del postulante">
          {enlaces.map(({ ruta, texto, subtitulo, icono }) => (
            <NavLink key={ruta} to={ruta} className={({ isActive }) => `ps-enlace ${isActive ? "activo" : ""}`}>
              <span className="ps-enlace-icono">{icono}</span>
              <span><strong>{texto}</strong><small>{subtitulo}</small></span>
            </NavLink>
          ))}
        </nav>
        <div className="ps-perfil-lateral">
          <div className="ps-avatar">{(nombre[0] || "P").toUpperCase()}</div>
          <div className="ps-perfil-nombre"><strong>{nombre}</strong><small>Postulante</small></div>
        </div>
        <button type="button" className="ps-cerrar" onClick={cerrarSesion}><FaSignOutAlt /> Cerrar sesión</button>
      </aside>
      <div className="ps-principal">
        <header className="ps-topbar">
          <span>Vita Pizzería · Portal de oportunidades</span>
          <div className="ps-topbar-cuenta"><span className="ps-avatar mini">{(nombre[0] || "P").toUpperCase()}</span><span>{nombre}</span></div>
        </header>
        <main className="ps-contenido"><Outlet /></main>
      </div>
    </div>
  );
}
