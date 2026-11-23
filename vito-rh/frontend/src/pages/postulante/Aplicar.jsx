import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormularioCandidato from "../../components/FormularioCandidato";
import {
  listarVacantesPostulante,
  obtenerMiPerfil,
  obtenerMiPostulacion,
  guardarMiPerfil,
  enviarMiPostulacion,
} from "../../services/postulanteService";

export default function Aplicar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [vacantes, setVacantes] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [tienePostulacion, setTienePostulacion] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);
  const [abrirFormulario, setAbrirFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    setCargando(true);
    Promise.all([listarVacantesPostulante(), obtenerMiPerfil(), obtenerMiPostulacion()])
      .then(([v, p, c]) => {
        if (!activo) return;
        setVacantes(v);
        setPerfil(p);
        setTienePostulacion(Boolean(c));
        const sugerida = v.find((item) => item.id === Number(location.state?.vacanteId));
        if (sugerida) setSeleccionada(sugerida);
      })
      .catch(() => {
        if (activo) setError("No pudimos cargar las vacantes y tu perfil.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => { activo = false; };
  }, [location.state?.vacanteId]);

  async function guardar(datos) {
    // Guarda la foto, las referencias y la información de contacto primero.
    // El backend vinculará la foto guardada con el nuevo Candidato.
    await guardarMiPerfil(datos);
    await enviarMiPostulacion(datos);
    setAbrirFormulario(false);
    navigate("/postulante/mi-postulacion");
  }

  return (
    <>
      <header className="ps-pagina-cabecera">
        <small>Completa y envía tu postulación</small>
        <h1>Aplicar a una vacante</h1>
      </header>
      {error && <div className="ps-alerta error">{error}</div>}
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <>
          {tienePostulacion && (
            <div className="ps-alerta ok">
              Ya enviaste tu postulación. <Link to="/postulante/mi-postulacion">Consulta su seguimiento aquí.</Link>
            </div>
          )}
          <div className="ps-grid ps-grid-aplicar">
            {vacantes.map((v) => (
              <article
                key={v.id}
                className={`ps-tarjeta ps-vacante ${seleccionada?.id === v.id ? "ps-seleccionado" : ""}`}
              >
                <span className="ps-etiqueta">{v.area?.nombre}</span>
                <h2>{v.nombre}</h2>
                <p>{v.descripcion.length > 110 ? v.descripcion.slice(0, 107) + "…" : v.descripcion}</p>
                <span className="ps-plazas">{v.plazasDisponibles} plaza(s) disponible(s)</span>
                <button
                  className="ps-boton"
                  type="button"
                  disabled={tienePostulacion}
                  onClick={() => setSeleccionada(v)}
                >
                  {seleccionada?.id === v.id ? "Vacante seleccionada" : "Seleccionar vacante"}
                </button>
              </article>
            ))}
            <aside className="ps-tarjeta ps-resumen">
              <h3>Resumen de postulación</h3>
              <p>{seleccionada ? `Vacante: ${seleccionada.nombre}` : "Selecciona una vacante para continuar."}</p>
              <ul className="ps-verificaciones">
                <li><span>✓</span> Datos personales</li>
                <li><span className={perfil?.telefono ? "" : "falta"}>{perfil?.telefono ? "✓" : "○"}</span> Información de contacto</li>
                <li><span className={perfil?.tieneFoto ? "" : "falta"}>{perfil?.tieneFoto ? "✓" : "○"}</span> Fotografía (opcional)</li>
                <li><span className={perfil?.referencias ? "" : "falta"}>{perfil?.referencias ? "✓" : "○"}</span> Referencias (opcional)</li>
              </ul>
              {vacantes.length === 0 && <p>Por ahora no hay vacantes abiertas.</p>}
              <button
                className="ps-boton ancho"
                type="button"
                disabled={!seleccionada || tienePostulacion}
                onClick={() => setAbrirFormulario(true)}
              >
                Continuar con mi formulario
              </button>
            </aside>
          </div>
        </>
      )}
      {abrirFormulario && seleccionada && (
        <FormularioCandidato
          vacantes={[seleccionada]}
          vacanteInicial={seleccionada.id}
          perfil={perfil}
          onGuardar={guardar}
          onCerrar={() => setAbrirFormulario(false)}
        />
      )}
    </>
  );
}
