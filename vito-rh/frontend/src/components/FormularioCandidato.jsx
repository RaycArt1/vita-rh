import { useEffect, useState } from "react";
import "./FormularioCandidato.css";

const FOTO_MAX = 3 * 1024 * 1024;
const CV_MAX = 5 * 1024 * 1024;

// El formulario se abre en «Aplicar» y usa la cuenta del postulante.
// La fotografía se guarda en «Mis datos» y también se vincula al candidato
// antes de enviar su postulación.
export default function FormularioCandidato({
  vacantes = [],
  vacanteInicial,
  perfil,
  onGuardar,
  onCerrar,
}) {
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [datos, setDatos] = useState({
    vacanteId: String(vacanteInicial || vacantes[0]?.id || ""),
    identidad: "",
    telefono: perfil?.telefono || "",
    direccion: perfil?.direccion || "",
    referencias: perfil?.referencias || "",
    observaciones: perfil?.observaciones || "",
    foto: null,
    cv: null,
  });
  const [vistaFoto, setVistaFoto] = useState("");

  useEffect(() => {
    if (!datos.foto) {
      setVistaFoto("");
      return undefined;
    }
    const url = URL.createObjectURL(datos.foto);
    setVistaFoto(url);
    return () => URL.revokeObjectURL(url);
  }, [datos.foto]);

  function actualizar(campo, valor) {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setError("");
  }

  function siguiente(evento) {
    evento.preventDefault();
    setError("");

    if (paso === 1) {
      if (!datos.vacanteId) return setError("Selecciona la vacante a la que deseas aplicar.");
      if (!datos.telefono.trim()) return setError("Ingresa tu teléfono de contacto.");
      if (datos.identidad.trim() && !/^\d{13}$/.test(datos.identidad.trim())) {
        return setError("El número de identidad debe contener 13 dígitos, sin guiones.");
      }
    }
    setPaso((actual) => Math.min(actual + 1, 3));
  }

  function seleccionarFoto(evento) {
    const archivo = evento.target.files?.[0] || null;
    if (archivo) {
      const extension = archivo.name.split(".").pop()?.toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(extension) ||
          !["image/jpeg", "image/png"].includes(archivo.type) ||
          archivo.size > FOTO_MAX) {
        evento.target.value = "";
        setError("La fotografía debe ser JPG o PNG y no superar los 3 MB.");
        return;
      }
    }
    actualizar("foto", archivo);
  }

  function seleccionarCV(evento) {
    const archivo = evento.target.files?.[0] || null;
    if (archivo &&
        (!archivo.name.toLowerCase().endsWith(".pdf") ||
          (archivo.type && archivo.type !== "application/pdf") ||
          archivo.size > CV_MAX)) {
      evento.target.value = "";
      setError("El currículum debe ser un PDF de máximo 5 MB.");
      actualizar("cv", null);
      return;
    }
    actualizar("cv", archivo);
  }

  async function guardar(evento) {
    evento.preventDefault();
    if (guardando) return;
    if (!datos.cv) return setError("Adjunta tu currículum en PDF para enviar la postulación.");
    setGuardando(true);
    setError("");
    try {
      await onGuardar({
        vacanteId: datos.vacanteId,
        identidad: datos.identidad.trim(),
        telefono: datos.telefono.trim(),
        direccion: datos.direccion.trim(),
        referencias: datos.referencias.trim(),
        observaciones: datos.observaciones.trim(),
        foto: datos.foto,
        cv: datos.cv,
      });
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          err.message ||
          "No se pudo enviar tu postulación. Vuelve a intentarlo."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fc-fondo" onClick={guardando ? undefined : onCerrar}>
      <div
        className="fc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="fc-encabezado">
          <div>
            <h2 id="fc-titulo">Mi postulación</h2>
            <p>Completa tu solicitud para trabajar en Vita Pizzería.</p>
          </div>
          <button type="button" onClick={onCerrar} disabled={guardando} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="fc-progreso">
          {["Datos personales", "Referencias", "Fotografía y CV"].map((titulo, indice) => (
            <div
              key={titulo}
              className={`fc-etapa ${paso === indice + 1 ? "actual" : ""} ${
                paso > indice + 1 ? "completada" : ""
              }`}
            >
              <span>{indice + 1}</span>
              <small>{titulo}</small>
            </div>
          ))}
        </div>

        <form onSubmit={paso === 3 ? guardar : siguiente}>
          {paso === 1 && (
            <div className="fc-campos">
              <p className="fc-archivo">Tus datos de nombre y correo vienen de tu cuenta de postulante.</p>
              <label>
                Nombre
                <input value={perfil?.nombre || ""} readOnly />
              </label>
              <label>
                Apellido
                <input value={perfil?.apellido || ""} readOnly />
              </label>
              <label>
                Correo electrónico
                <input value={perfil?.email || ""} readOnly />
              </label>
              <label>
                Identidad (13 dígitos, opcional)
                <input
                  inputMode="numeric"
                  maxLength={13}
                  placeholder="0801199901234"
                  value={datos.identidad}
                  onChange={(e) => actualizar("identidad", e.target.value)}
                />
              </label>
              <label>
                Teléfono de contacto *
                <input
                  type="tel"
                  maxLength={24}
                  required
                  placeholder="9999-9999"
                  value={datos.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                />
              </label>
              <label>
                Dirección
                <textarea
                  rows={2}
                  maxLength={400}
                  placeholder="Colonia, ciudad y referencias de ubicación"
                  value={datos.direccion}
                  onChange={(e) => actualizar("direccion", e.target.value)}
                />
              </label>
              <label>
                Vacante a la que deseas aplicar *
                <select
                  value={datos.vacanteId}
                  onChange={(e) => actualizar("vacanteId", e.target.value)}
                  required
                >
                  <option value="">Seleccionar vacante</option>
                  {vacantes.map((vacante) => (
                    <option key={vacante.id} value={String(vacante.id)}>
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
                Referencias personales o laborales
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Nombre, relación o empresa y teléfono de contacto"
                  value={datos.referencias}
                  onChange={(e) => actualizar("referencias", e.target.value)}
                />
              </label>
              <label>
                Experiencia u observaciones adicionales
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="Cuéntanos brevemente sobre tu experiencia (opcional)"
                  value={datos.observaciones}
                  onChange={(e) => actualizar("observaciones", e.target.value)}
                />
              </label>
              <p className="fc-archivo">
                Puedes actualizar esta información después en «Mis datos».
              </p>
            </div>
          )}

          {paso === 3 && (
            <div className="fc-campos">
              <label>
                Fotografía de perfil (opcional; JPG o PNG, máximo 3 MB)
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={seleccionarFoto}
                />
              </label>
              {vistaFoto && (
                <img
                  src={vistaFoto}
                  alt="Vista previa de tu fotografía"
                  style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover" }}
                />
              )}
              {!datos.foto && perfil?.tieneFoto && (
                <p className="fc-archivo">Ya tienes una fotografía guardada en «Mis datos». Se utilizará esa.</p>
              )}
              <label>
                Currículum en PDF *
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={seleccionarCV}
                  required={!datos.cv}
                />
              </label>
              {datos.cv && <p className="fc-archivo">CV seleccionado: {datos.cv.name}</p>}
            </div>
          )}

          {error && <p className="fc-error" role="alert">{error}</p>}

          <div className="fc-acciones">
            <button type="button" className="fc-cancelar" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </button>
            {paso > 1 && (
              <button
                type="button"
                className="fc-atras"
                disabled={guardando}
                onClick={() => { setPaso((actual) => actual - 1); setError(""); }}
              >
                Anterior
              </button>
            )}
            <button type="submit" className="fc-principal" disabled={guardando}>
              {guardando ? "Enviando…" : paso === 3 ? "Enviar postulación" : "Siguiente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
