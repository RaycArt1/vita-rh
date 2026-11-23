import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerMiPostulacion, responderMiOferta } from "../../services/postulanteService";

const pasos = ["Enviado", "En revisión", "Entrevista", "Evaluación", "Oferta laboral", "Aceptado", "Contratación"];
const mapa = { APLICACION: 1, REVISION_CV: 2, ENTREVISTA: 3, EVALUACION: 4, OFERTA: 5, CONTRATADO: 7 };
const fechaHn = (v) => v ? new Date(v).toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Tegucigalpa" }) : "Por definir";
const soloFecha = (v) => v ? new Date(v).toLocaleDateString("es-HN", { dateStyle: "medium", timeZone: "America/Tegucigalpa" }) : "Por definir";

export default function MiPostulacion() {
  const [postulacion, setPostulacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const cargar = useCallback(async () => {
    try { setPostulacion(await obtenerMiPostulacion()); }
    catch (err) { setError(err.response?.data?.mensaje || "No pudimos cargar el seguimiento."); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  async function responder(respuesta) {
    if (!window.confirm(`¿Confirmas que deseas ${respuesta === "ACEPTADA" ? "aceptar" : "rechazar"} esta oferta?`)) return;
    setProcesando(true); setError(""); setMensaje("");
    try { const r = await responderMiOferta(respuesta); setMensaje(r.mensaje); await cargar(); }
    catch (err) { setError(err.response?.data?.mensaje || "No se pudo guardar tu respuesta."); }
    finally { setProcesando(false); }
  }

  const oferta = postulacion?.oferta;
  const actual = postulacion?.estado === "CONTRATADO" ? 7 : oferta?.estado === "ACEPTADA" ? 6 : mapa[postulacion?.etapa] || 1;
  return <div className="ps-seguimiento">
    <header className="ps-pagina-cabecera"><small>Seguimiento privado de tu proceso</small><h1>Estado de mi postulación</h1></header>
    {error && <p className="ps-alerta error">{error}</p>}{mensaje && <p className="ps-alerta ok">{mensaje}</p>}
    {cargando ? <p>Cargando tu postulación…</p> : !postulacion ?
      <div className="ps-vacio">Todavía no has enviado una postulación. <Link to="/postulante/aplicar">Explorar vacantes</Link></div> :
      <>
        <section className="ps-tarjeta">
          <div className="ps-card-label"><span className="ps-etiqueta">{postulacion.vacante?.area?.nombre || "Vita Pizzería"}</span><span className="ps-estado">{postulacion.estado === "DESCARTADO" ? "Proceso finalizado" : postulacion.estado === "CONTRATADO" ? "Contratado" : oferta?.estado === "ACEPTADA" ? "Oferta aceptada" : "En proceso"}</span></div>
          <h2>{postulacion.puestoAplicado}</h2><p>Enviada el {soloFecha(postulacion.fechaRegistro)}</p>
          <div className="ps-progreso" aria-label="Etapas de selección">
            {pasos.map((paso, i) => <div key={paso} className={`ps-paso ${i + 1 < actual ? "hecho" : i + 1 === actual ? "actual" : ""}`}>
              <div className="ps-paso-num">{i + 1}</div><span>{paso}</span>
            </div>)}
          </div>
          {postulacion.estado === "DESCARTADO" && <p className="ps-alerta error" style={{ marginTop: 20 }}>Esta postulación finalizó. {postulacion.motivoDescarte || "Gracias por tu interés en Vita Pizzería."}</p>}
        </section>
        {postulacion.entrevistas?.length > 0 && <section className="ps-tarjeta">
          <h2>Mis entrevistas</h2>
          {postulacion.entrevistas.map((ent) => <div className="ps-apartado" key={ent.id}>
            <h3>Entrevista · fase {ent.fase}</h3>
            <p><strong>Fecha y hora:</strong> {fechaHn(ent.fecha)}</p>
            <p><strong>Modalidad:</strong> {ent.modalidad === "TELEFONICA" ? "Telefónica" : ent.modalidad === "VIRTUAL" ? "Virtual" : "Presencial"}</p>
            <p><strong>Estado:</strong> {ent.estadoEntrevista || "PENDIENTE"}</p>
            {ent.indicaciones && <p><strong>Indicaciones:</strong> {ent.indicaciones}</p>}
          </div>)}
        </section>}
        {oferta && <section className="ps-tarjeta">
          <h2>Mi oferta laboral</h2>
          <p>Revisa la propuesta de Vita Pizzería y registra tu decisión.</p>
          <div className="ps-oferta-datos">
            <div>Tipo de contrato<strong>{oferta.tipoContrato}</strong></div>
            <div>Salario propuesto<strong>L {Number(oferta.salario).toLocaleString("es-HN", { minimumFractionDigits: 2 })}</strong></div>
            <div>Fecha de inicio<strong>{soloFecha(oferta.fechaInicio)}</strong></div>
            <div>Estado<strong>{oferta.estado === "PENDIENTE" ? "Pendiente de tu respuesta" : oferta.estado === "ACEPTADA" ? "Aceptada" : "Rechazada"}</strong></div>
          </div>
          {oferta.estado === "PENDIENTE" && postulacion.etapa === "OFERTA" && postulacion.estado === "EN_PROCESO" && <div className="ps-modal-acciones">
            <button type="button" className="ps-boton" disabled={procesando} onClick={() => responder("ACEPTADA")}>Aceptar oferta</button>
            <button type="button" className="ps-boton secundario" disabled={procesando} onClick={() => responder("RECHAZADA")}>Rechazar oferta</button>
          </div>}
          {oferta.estado === "ACEPTADA" && postulacion.estado !== "CONTRATADO" && <p className="ps-alerta ok" style={{ marginTop: 15 }}>Aceptaste la oferta. El equipo de Recursos Humanos continuará el proceso de contratación.</p>}
        </section>}
      </>}
  </div>;
}
