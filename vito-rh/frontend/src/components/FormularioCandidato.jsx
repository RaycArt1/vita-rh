
import { useState } from "react";
import "./FormularioCandidato.css";

const datosIniciales = {
  nombre: "",
  correo: "",
  fecha: new Date().toISOString().slice(0, 10),
  puesto: "",
  telefono: "",
  direccion: "",
  referencias: "",
  notas: "",
  foto: null,
  cv: null,
};

export default function FormularioCandidato({
  vacantes = [],
  onGuardar,
  onCerrar,
}) {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState(datosIniciales);
  const [error, setError] = useState("");

  const actualizar = (campo, valor) => {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
    setError("");
  };

  const siguiente = (evento) => {
    evento.preventDefault();

    if (paso === 1) {
      if (!datos.nombre.trim() || !datos.correo.trim() || !datos.puesto) {
        setError("Completa los campos obligatorios.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
        setError("Ingresa un correo electrónico válido.");
        return;
      }
    }

    if (paso === 2 && !datos.telefono.trim()) {
      setError("Ingresa el teléfono del candidato.");
      return;
    }

    setError("");
    setPaso((actual) => Math.min(actual + 1, 3));
  };

  const guardar = (evento) => {
    evento.preventDefault();

    if (!datos.cv) {
      setError("Debes seleccionar un currículum en PDF.");
      return;
    }

    onGuardar({
      id: Date.now(),
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim(),
      fecha: datos.fecha,
      puesto: datos.puesto,
      telefono: datos.telefono.trim(),
      direccion: datos.direccion.trim(),
      referencias: datos.referencias.trim(),
      notas: datos.notas.trim(),
      foto: datos.foto,
      cv: datos.cv,
      estado: "Aplicación",
      puntuacion: 0,
    });
  };

  return (
    <div className="fc-fondo" onClick={onCerrar}>
      <div
        className="fc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="fc-encabezado">
          <div>
            <h2 id="fc-titulo">Nuevo candidato</h2>
            <p>Registra una nueva postulación en Vita RH.</p>
          </div>
          <button type="button" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="fc-progreso">
          {["Datos personales", "Contacto y referencias", "Notas y CV"].map(
            (titulo, indice) => (
              <div
                key={titulo}
                className={`fc-etapa ${paso === indice + 1 ? "actual" : ""} ${
                  paso > indice + 1 ? "completada" : ""
                }`}
              >
                <span>{indice + 1}</span>
                <small>{titulo}</small>
              </div>
            )
          )}
        </div>

        <form onSubmit={paso === 3 ? guardar : siguiente}>
          {paso === 1 && (
            <div className="fc-campos">
              <label>
                Nombre completo *
                <input
                  value={datos.nombre}
                  onChange={(e) => actualizar("nombre", e.target.value)}
                  placeholder="Nombre y apellido"
                  required
                />
              </label>

              <label>
                Correo electrónico *
                <input
                  type="email"
                  value={datos.correo}
                  onChange={(e) => actualizar("correo", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </label>

              <label>
                Fecha de aplicación
                <input
                  type="date"
                  value={datos.fecha}
                  onChange={(e) => actualizar("fecha", e.target.value)}
                  required
                />
              </label>

              <label>
                Puesto solicitado *
                <select
                  value={datos.puesto}
                  onChange={(e) => actualizar("puesto", e.target.value)}
                  required
                >
                  <option value="">Seleccionar puesto</option>
                  {vacantes.map((vacante) => (
                    <option key={vacante.id} value={vacante.nombre}>
                      {vacante.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {paso === 2 && (
            <div className="fc-campos">
              <label>
                Teléfono *
                <input
                  type="tel"
                  value={datos.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                  placeholder="9999-9999"
                  required
                />
              </label>

              <label>
                Dirección
                <textarea
                  rows={3}
                  value={datos.direccion}
                  onChange={(e) => actualizar("direccion", e.target.value)}
                  placeholder="Dirección del candidato"
                />
              </label>

              <label>
                Referencias
                <textarea
                  rows={3}
                  value={datos.referencias}
                  onChange={(e) => actualizar("referencias", e.target.value)}
                  placeholder="Nombre y teléfono de las referencias"
                />
              </label>
            </div>
          )}

          {paso === 3 && (
            <div className="fc-campos">
              <label>
                Notas adicionales
                <textarea
                  rows={3}
                  value={datos.notas}
                  onChange={(e) => actualizar("notas", e.target.value)}
                  placeholder="Observaciones sobre el candidato"
                />
              </label>

              <label>
                Fotografía (opcional)
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) =>
                    actualizar("foto", e.target.files?.[0] || null)
                  }
                />
              </label>

              <label>
                Currículum en PDF *
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const archivo = e.target.files?.[0] || null;

                    if (
                      archivo &&
                      (archivo.type !== "application/pdf" ||
                        archivo.size > 5 * 1024 * 1024)
                    ) {
                      actualizar("cv", null);
                      setError("Selecciona un PDF de máximo 5 MB.");
                      e.target.value = "";
                      return;
                    }

                    actualizar("cv", archivo);
                  }}
                />
              </label>

              {datos.cv && (
                <p className="fc-archivo">Archivo: {datos.cv.name}</p>
              )}
            </div>
          )}

          {error && <p className="fc-error" role="alert">{error}</p>}

          <div className="fc-acciones">
            <button type="button" className="fc-cancelar" onClick={onCerrar}>
              Cancelar
            </button>

            {paso > 1 && (
              <button
                type="button"
                className="fc-atras"
                onClick={() => {
                  setPaso(paso - 1);
                  setError("");
                }}
              >
                Anterior
              </button>
            )}

            <button type="submit" className="fc-principal">
              {paso === 3 ? "Guardar candidato" : "Siguiente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
