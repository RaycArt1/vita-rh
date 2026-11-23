import { useState, useEffect } from "react";
import axios from "axios";

export default function PermisosAdmin({ rolSeleccionado }) {
  const [permisos, setPermisos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  // 1. CARGAR LOS PERMISOS ACTUALES AL ABRIR O CAMBIAR DE ROL
  useEffect(() => {
    async function cargarPermisosActuales() {
      if (!rolSeleccionado) return;
      try {
        setCargando(true);
        const respuesta = await axios.get(`/api/roles/${rolSeleccionado}/permisos`);
        
        // Verificamos qué formato trae la respuesta y extraemos los permisos en minúsculas para estandarizar
        const datosApi = respuesta.data.permisos || respuesta.data || [];
        const permisosEnMinusculas = datosApi.map(p => 
          typeof p === 'string' ? p.toLowerCase() : (p.nombre || p.modulo || "").toLowerCase()
        );

        setPermisos(permisosEnMinusculas);
      } catch (error) {
        console.error("Error al cargar los permisos actuales:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarPermisosActuales();
  }, [rolSeleccionado]);

  // 2. FUNCIÓN PARA MARCAR / DESMARCAR Y GUARDAR AL INSTANTE
  const handleTogglePermiso = async (moduloId) => {
    const moduloLower = moduloId.toLowerCase();
    const permisosActualizados = permisos.includes(moduloLower)
      ? permisos.filter((p) => p !== moduloLower)
      : [...permisos, moduloLower];

    setPermisos(permisosActualizados);

    try {
      await axios.post(`/api/roles/${rolSeleccionado}/permisos`, {
        permisos: permisosActualizados
      });

      // Sincronizamos con localStorage para que el Sidebar del Chef los lea al instante
      if (rolSeleccionado === 4) {
        const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");
        usuarioActual.permisos = permisosActualizados;
        localStorage.setItem("usuario", JSON.stringify(usuarioActual));
      }

      setMensaje("Permisos actualizados correctamente");
      setTimeout(() => setMensaje(""), 3000);
    } catch (error) {
      console.error("Error al actualizar el permiso:", error);
      setMensaje("Error al guardar los cambios");
    }
  };

  if (cargando) {
    return <div className="p-3 text-center">Cargando permisos...</div>;
  }

  // Función auxiliar para verificar si un módulo está activo (sin importar mayúsculas/minúsculas)
  const estaActivo = (id) => permisos.includes(id.toLowerCase());

  return (
    <div className="permisos-admin-container p-3">
      {mensaje && <div className="alert alert-info py-1 mb-2">{mensaje}</div>}

      <div className="permisos-list">
        {/* EMPLEADOS */}
        <div className="form-check form-switch mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="empleados"
            checked={estaActivo("empleados")}
            onChange={() => handleTogglePermiso("empleados")}
          />
          <label className="form-check-label" htmlFor="empleados">Empleados</label>
        </div>

        {/* CALENDARIOS */}
        <div className="form-check form-switch mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="calendarios"
            checked={estaActivo("calendarios") || estaActivo("calendario")}
            onChange={() => handleTogglePermiso("calendarios")}
          />
          <label className="form-check-label" htmlFor="calendarios">Calendarios</label>
        </div>

        {/* REPORTES */}
        <div className="form-check form-switch mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="reportes"
            checked={estaActivo("reportes")}
            onChange={() => handleTogglePermiso("reportes")}
          />
          <label className="form-check-label" htmlFor="reportes">Reportes</label>
        </div>

        {/* SOLICITUDES */}
        <div className="form-check form-switch mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="solicitudes"
            checked={estaActivo("solicitudes")}
            onChange={() => handleTogglePermiso("solicitudes")}
          />
          <label className="form-check-label" htmlFor="solicitudes">Solicitudes</label>
        </div>

        {/* RECLUTAMIENTO */}
        <div className="form-check form-switch mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="reclutamiento"
            checked={estaActivo("reclutamiento")}
            onChange={() => handleTogglePermiso("reclutamiento")}
          />
          <label className="form-check-label" htmlFor="reclutamiento">Reclutamiento</label>
        </div>

        {/* PLANILLAS */}
        <div className="form-check form-switch mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="planillas"
            checked={estaActivo("planillas")}
            onChange={() => handleTogglePermiso("planillas")}
          />
          <label className="form-check-label" htmlFor="planillas">Planillas</label>
        </div>

        {/* HISTORIAL */}
        <div className="form-check form-switch mb-2">
          <input
            type="checkbox"
            className="form-check-input"
            id="historial"
            checked={estaActivo("historial") || estaActivo("bitacora")}
            onChange={() => handleTogglePermiso("historial")}
          />
          <label className="form-check-label" htmlFor="historial">Historial / Bitácora</label>
        </div>
      </div>
    </div>
  );
}