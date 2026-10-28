import { useState, useEffect } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function Mantenimiento() {
  const [areas, setAreas] = useState([]);
  const [nombreArea, setNombreArea] = useState("");
  const [descripcionArea, setDescripcionArea] = useState("");
  
  const [nombrePuesto, setNombrePuesto] = useState("");
  const [areaIdSeleccionada, setAreaIdSeleccionada] = useState("");
  
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarAreas();
  }, []);

  async function cargarAreas() {
    try {
      const respuesta = await api.get("/mantenimiento/areas");
      if (respuesta.data?.exito) {
        setAreas(respuesta.data.data);
      }
    } catch (error) {
      console.error("Error al cargar áreas:", error);
    }
  }

  async function manejarCrearArea(e) {
    e.preventDefault();
    try {
      const respuesta = await api.post("/mantenimiento/areas", {
        nombre: nombreArea,
        descripcion: descripcionArea,
      });
      if (respuesta.data?.exito) {
        setMensaje("¡Área creada exitosamente!");
        setNombreArea("");
        setDescripcionArea("");
        cargarAreas();
      }
    } catch (error) {
      setMensaje("Error al crear el área.");
    }
  }

  async function manejarCrearPuesto(e) {
    e.preventDefault();
    try {
      const respuesta = await api.post("/mantenimiento/puestos", {
        nombre: nombrePuesto,
        areaId: areaIdSeleccionada,
      });
      if (respuesta.data?.exito) {
        setMensaje("¡Puesto creado exitosamente!");
        setNombrePuesto("");
        setAreaIdSeleccionada("");
        cargarAreas();
      }
    } catch (error) {
      setMensaje("Error al crear el puesto.");
    }
  }

  return (
    <MainLayout>
      <div className="container-fluid p-4">
        <h2 className="mb-4 fw-bold">Mantenimiento: Áreas y Puestos</h2>

        {mensaje && <div className="alert alert-info">{mensaje}</div>}

        <div className="row g-4">
          {/* Formulario de Áreas */}
          <div className="col-md-6">
            <div className="card shadow-sm p-4">
              <h4 className="mb-3 text-danger">Crear Nueva Área</h4>
              <form onSubmit={manejarCrearArea}>
                <div className="mb-3">
                  <label className="form-label">Nombre del Área</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombreArea}
                    onChange={(e) => setNombreArea(e.target.value)}
                    placeholder="Ej. Cocina, Administración..."
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <input
                    type="text"
                    className="form-control"
                    value={descripcionArea}
                    onChange={(e) => setDescripcionArea(e.target.value)}
                    placeholder="Breve descripción..."
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">
                  Guardar Área
                </button>
              </form>
            </div>
          </div>

          {/* Formulario de Puestos */}
          <div className="col-md-6">
            <div className="card shadow-sm p-4">
              <h4 className="mb-3 text-danger">Crear Nuevo Puesto</h4>
              <form onSubmit={manejarCrearPuesto}>
                <div className="mb-3">
                  <label className="form-label">Seleccionar Área</label>
                  <select
                    className="form-select"
                    value={areaIdSeleccionada}
                    onChange={(e) => setAreaIdSeleccionada(e.target.value)}
                    required
                  >
                    <option value="">Selecciona un área...</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre del Puesto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombrePuesto}
                    onChange={(e) => setNombrePuesto(e.target.value)}
                    placeholder="Ej. Pizzero Master, Cajero..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">
                  Guardar Puesto
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}