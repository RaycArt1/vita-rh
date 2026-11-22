import { FaSignOutAlt } from "react-icons/fa";

function obtenerUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem("gestRH_usuario")) || {};
  } catch {
    return {};
  }
}

const ETIQUETA_ROL = {
  ADMINISTRADOR: "Administrador",
  CHEF: "Chef Ejecutivo",
  EMPLEADO: "Empleado",
  CLIENTE: "Cliente",
};

export default function Navbar() {
  const usuario = obtenerUsuario();
  const username = usuario.username || "Usuario";
  const iniciales = username.slice(0, 2).toUpperCase();
  const rolTexto = ETIQUETA_ROL[usuario.rol] ?? usuario.rol ?? "";

  function cerrarSesion() {
    sessionStorage.removeItem("gestRH_token");
    sessionStorage.removeItem("gestRH_usuario");
    window.location.assign("/login");
  }

  return (
    <header className="dashboard-topbar d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <span className="fw-semibold text-secondary">Vito Pizzería · Gestión de Recursos Humanos</span>
       
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-1 bg-light">
          <div
            className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: 32, height: 32, fontSize: 13 }}
          >
            {iniciales}
          </div>
          <div className="text-start d-none d-sm-block" style={{ lineHeight: 1.2 }}>
            <strong className="d-block text-dark" style={{ fontSize: 13 }}>{username}</strong>
            <span className="text-muted" style={{ fontSize: 11 }}>{rolTexto}</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          onClick={cerrarSesion}
          title="Cerrar sesión"
        >
          <FaSignOutAlt />
          <span className="d-none d-md-inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}