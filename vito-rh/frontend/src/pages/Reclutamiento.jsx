
import { useState } from "react";
import "./Reclutamiento.css";
import FormularioCandidato from "../components/FormularioCandidato";
import PerfilCandidato from "../components/PerfilCandidato";


const vacantesIniciales = [
  {
    id: 1,
    area: "Cocina",
    nombre: "Pizzero",
    descripcion: "Preparación de pizzas artesanales y manejo de horno.",
  },
  {
    id: 2,
    area: "Servicio",
    nombre: "Mesero",
    descripcion: "Atención de mesa y experiencia al cliente.",
  },

];

const candidatosIniciales = [
  {
    id: 1,
    nombre: "Valentina Ríos",
    puesto: "Mesera",
    fecha: "2026-08-01",
    estado: "Entrevista",
    puntuacion: 8,
  },

  {
    id: 3,
    nombre: "Marcela Fuentes",
    puesto: "Cajera",
    fecha: "2026-07-25",
    estado: "Oferta",
    puntuacion: 9,
  },
  {
    id: 4,
    nombre: "Camilo Vargas",
    puesto: "Pizzero",
    fecha: "2026-07-28",
    estado: "Evaluación",
    puntuacion: 9,
  },
  {
    id: 5,
    nombre: "Diana Suárez",
    puesto: "Auxiliar de cocina",
    fecha: "2026-07-15",
    estado: "Descartado",
    puntuacion: 4,
  },
];

const etapas = [
  "Aplicación",
  "Revisión CV",
  "Entrevista",
  "Evaluación",
  "Oferta",
  "Contratado",
];

export default function Reclutamiento() {
const [vacantes, setVacantes] = useState(vacantesIniciales);
const [candidatos, setCandidatos] = useState(candidatosIniciales);
const [mostrarFormularioCandidato, setMostrarFormularioCandidato] = useState(false);
const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);

const guardarCandidato = (nuevoCandidato) => {
  setCandidatos((anteriores) => [...anteriores, nuevoCandidato]);
  setMostrarFormularioCandidato(false);
};

const actualizarCandidato = (candidatoActualizado) => {
  setCandidatos((anteriores) =>
    anteriores.map((candidato) =>
      candidato.id === candidatoActualizado.id
        ? candidatoActualizado
        : candidato
    )
  );

  setCandidatoSeleccionado(candidatoActualizado);
};

const [mostrarFormularioVacante, setMostrarFormularioVacante] = useState(false);

const [nuevaVacante, setNuevaVacante] = useState({
  nombre: "",
  area: "Cocina",
  descripcion: "",
});

const guardarVacante = (evento) => {
  evento.preventDefault();

  if (!nuevaVacante.nombre.trim() || !nuevaVacante.descripcion.trim()) {
    return;
  }

  setVacantes((anteriores) => [
    ...anteriores,
    {
      id: Date.now(),
      nombre: nuevaVacante.nombre.trim(),
      area: nuevaVacante.area,
      descripcion: nuevaVacante.descripcion.trim(),
    },
  ]);

  setNuevaVacante({
    nombre: "",
    area: "Cocina",
    descripcion: "",
  });

  setMostrarFormularioVacante(false);
};

  const candidatosActivos = candidatos.filter(
    (candidato) => candidato.estado !== "Descartado"
  );

  const obtenerIniciales = (nombre) =>
    nombre
      .split(" ")
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();

  return (
    <main className="reclutamiento">
      <div className="reclutamiento-encabezado">
        <div>
          <p className="reclutamiento-subtitulo">
            {candidatosActivos.length} candidatos activos — Vito Pizzería
          </p>
          <h1>Reclutamiento y Selección</h1>
        </div>

        <div className="reclutamiento-acciones">
        <button
  type="button"
  className="reclutamiento-btn-secundario"
  onClick={() => setMostrarFormularioVacante(true)}
>
  + Crear vacante
</button>
          <button
  type="button"
  className="reclutamiento-btn-principal"
  onClick={() => setMostrarFormularioCandidato(true)}
>
  + Nuevo Candidato
</button>
        </div>
      </div>

      <section className="reclutamiento-vacantes">
        {vacantes.map((vacante) => (
          <article className="reclutamiento-vacante" key={vacante.id}>
            <span className="reclutamiento-etiqueta">
              {vacante.area}
            </span>
            <h3>{vacante.nombre}</h3>
            <p>{vacante.descripcion}</p>
          </article>
        ))}
      </section>

      <section className="reclutamiento-pipeline">
        <h2>PIPELINE DE SELECCIÓN</h2>

        <div className="reclutamiento-etapas">
          {etapas.map((etapa) => (
            <div className="reclutamiento-etapa" key={etapa}>
              <strong>
                {
                  candidatos.filter(
                    (candidato) => candidato.estado === etapa
                  ).length
                }
              </strong>
              <span>{etapa}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="reclutamiento-lista">
        {candidatos.map((candidato) => (
          <article
  className="reclutamiento-candidato"
  key={candidato.id}
  role="button"
  tabIndex={0}
  onClick={() => setCandidatoSeleccionado(candidato)}
  onKeyDown={(evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      setCandidatoSeleccionado(candidato);
    }
  }}
  style={{ cursor: "pointer" }}
>
            <div className="reclutamiento-avatar">
              {obtenerIniciales(candidato.nombre)}
            </div>

            <div className="reclutamiento-datos">
              <div className="reclutamiento-nombre-estado">
                <h3>{candidato.nombre}</h3>
                <span className="reclutamiento-estado">
                  {candidato.estado}
                </span>
              </div>

              <p>
                {candidato.puesto} · {candidato.fecha}
              </p>
            </div>

            <div className="reclutamiento-puntuacion">
              <div className="reclutamiento-barras">
                {Array.from({ length: 10 }, (_, indice) => (
                  <span
                    key={indice}
                    className={
                      indice < candidato.puntuacion ? "activa" : ""
                    }
                  />
                ))}
              </div>
              <small>{candidato.puntuacion}/10</small>
            </div>
          </article>
        ))}
      </section>
      
{mostrarFormularioVacante && (
  <div
    className="reclutamiento-modal-fondo"
    onClick={() => setMostrarFormularioVacante(false)}
  >
    <div
      className="reclutamiento-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-crear-vacante"
      onClick={(evento) => evento.stopPropagation()}
    >
      <div className="reclutamiento-modal-encabezado">
        <div>
          <h2 id="titulo-crear-vacante">Crear vacante</h2>
          <p>Publica una nueva oportunidad para postulantes.</p>
        </div>

        <button
          type="button"
          className="reclutamiento-btn-secundario"
          onClick={() => setMostrarFormularioVacante(false)}
        >
          ← Volver
        </button>
      </div>

      <form onSubmit={guardarVacante}>
        <label htmlFor="vacante-nombre">NOMBRE DE LA VACANTE</label>
        <input
          id="vacante-nombre"
          type="text"
          required
          maxLength={100}
          value={nuevaVacante.nombre}
          onChange={(evento) =>
            setNuevaVacante({
              ...nuevaVacante,
              nombre: evento.target.value,
            })
          }
        />

        <label htmlFor="vacante-area">ÁREA</label>
        <select
          id="vacante-area"
          value={nuevaVacante.area}
          onChange={(evento) =>
            setNuevaVacante({
              ...nuevaVacante,
              area: evento.target.value,
            })
          }
        >
          <option value="Cocina">Cocina</option>
          <option value="Servicio">Servicio</option>
          <option value="Domicilios">Domicilios</option>
          <option value="Administración">Administración</option>
        </select>

        <label htmlFor="vacante-descripcion">DESCRIPCIÓN</label>
        <textarea
          id="vacante-descripcion"
          rows={4}
          required
          value={nuevaVacante.descripcion}
          onChange={(evento) =>
            setNuevaVacante({
              ...nuevaVacante,
              descripcion: evento.target.value,
            })
          }
        />

        <div className="reclutamiento-modal-acciones">
          <button
            type="button"
            className="reclutamiento-btn-secundario"
            onClick={() => setMostrarFormularioVacante(false)}
          >
            Cancelar
          </button>

          <button type="submit" className="reclutamiento-btn-principal">
            Guardar vacante
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{mostrarFormularioCandidato && (
  <FormularioCandidato
    vacantes={vacantes}
    onGuardar={guardarCandidato}
    onCerrar={() => setMostrarFormularioCandidato(false)}
  />
)}


{candidatoSeleccionado && (
  <PerfilCandidato
    candidato={candidatoSeleccionado}
    onActualizar={actualizarCandidato}
    onCerrar={() => setCandidatoSeleccionado(null)}
  />
)}


    </main>
  );
}
