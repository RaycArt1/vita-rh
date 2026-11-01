
import { FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  function cerrarSesion() {
    sessionStorage.removeItem("gestRH_token");
    sessionStorage.removeItem("gestRH_usuario");
    window.location.assign("/login");
  }

  return (
    <header className="dashboard-topbar d-flex justify-content-between align-items-center px-4 py-2 bg-white border-bottom shadow-sm">
      {/* Título o bienvenida a la izquierda */}
      <div className="d-flex align-items-center gap-3">
        <span className="fw-semibold text-secondary">Vito Pizzería · Gestión de Recursos Humanos</span>
        <span className="dashboard-topbar-status badge bg-light text-dark border d-none d-md-inline-flex align-items-center gap-1">
          <span className="dashboard-status-dot bg-success rounded-circle" style={{ width: 8, height: 8 }} />
          Entorno de demostración
        </span>
      </div>

      {/* Perfil de usuario y cerrar sesión a la derecha */}
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2 border rounded-pill px-3 py-1 bg-light">
          <div 
            className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold" 
            style={{ width: 32, height: 32, fontSize: 13 }}
          >
            AV
          </div>
          <div className="text-start d-none d-sm-block" style={{ lineHeight: 1.2 }}>
            <strong className="d-block text-dark" style={{ fontSize: 13 }}>Administrador Vita</strong>
            <span className="text-muted" style={{ fontSize: 11 }}>Administrador</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          onClick={cerrarSesion}
          title="Cerrar sesión"
        >
          <FaSignOutAlt />
          <span className="d-none d-md-inline">Cerrar Sesion</span>
        </button>
      </div>
    </header>
  );
}
