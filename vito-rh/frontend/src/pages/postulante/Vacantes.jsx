import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarVacantesPostulante } from "../../services/postulanteService";

export default function Vacantes() {
  const [vacantes, setVacantes] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    listarVacantesPostulante().then(setVacantes).catch(() => setError("No se pudieron cargar las vacantes. Comprueba el backend.")).finally(() => setCargando(false));
  }, []);
  return <>
    <header className="ps-pagina-cabecera"><small>Encuentra tu próxima oportunidad en Vita Pizzería</small><h1>Vacantes disponibles</h1></header>
    {error && <p className="ps-alerta error">{error}</p>}
    {cargando ? <p>Cargando vacantes…</p> : vacantes.length === 0 ? <p className="ps-vacio">Por el momento no hay vacantes abiertas.</p> :
      <div className="ps-grid">{vacantes.map((v) => <article className="ps-tarjeta ps-vacante" key={v.id}>
        <span className="ps-etiqueta">{v.area?.nombre || "Vita"}</span>
        <h2>{v.nombre}</h2><p>{v.descripcion.length > 155 ? v.descripcion.slice(0, 152) + "…" : v.descripcion}</p>
        <span className="ps-plazas">{v.plazasDisponibles} plaza(s) disponible(s)</span>
        <button type="button" className="ps-boton" onClick={() => setDetalle(v)}>Ver información de la vacante</button>
      </article>)}</div>}
    {detalle && <div className="ps-overlay" onClick={() => setDetalle(null)}>
      <section className="ps-modal" role="dialog" aria-modal="true" aria-label="Información de la vacante" onClick={(e) => e.stopPropagation()}>
        <span className="ps-etiqueta">{detalle.area?.nombre}</span><h2>{detalle.nombre}</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{detalle.descripcion}</p>
        <p><strong>Plazas disponibles:</strong> {detalle.plazasDisponibles}</p>
        <div className="ps-modal-acciones">
          <Link className="ps-boton" to="/postulante/aplicar" state={{ vacanteId: detalle.id }}>Quiero aplicar</Link>
          <button className="ps-boton secundario" type="button" onClick={() => setDetalle(null)}>Cerrar</button>
        </div>
      </section>
    </div>}
  </>;
}
