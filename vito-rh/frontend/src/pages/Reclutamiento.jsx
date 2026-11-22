import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import "./Reclutamiento.css";
import FormularioCandidato from "../components/FormularioCandidato";
import PerfilCandidato from "../components/PerfilCandidato";
import {
  crearCandidato,
  obtenerCandidatos,
  actualizarEstadoCandidato,
  obtenerVacantes,
  crearVacante,
  obtenerAreas,
} from "../services/reclutamientoService";



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
  "Referencias",
  "Entrevista",
  "Evaluación",
  "Oferta",
  "Contratado",
];

export default function Reclutamiento() {
const [vacantes, setVacantes] = useState([]);
const [areas, setAreas] = useState([]);
const [guardandoVacante, setGuardandoVacante] = useState(false);

useEffect(() => {
  const cargarVacantesYAreas = async () => {
    try {
      const [vacantesGuardadas, areasGuardadas] = await Promise.all([
        obtenerVacantes(),
        obtenerAreas(),
      ]);
      setVacantes(vacantesGuardadas);
      setAreas(areasGuardadas);
    } catch (error) {
      console.error("Error al cargar vacantes o áreas:", error);
    }
  };

  cargarVacantesYAreas();
}, []);
const [candidatos, setCandidatos] = useState([]);
const [vistaCandidatos, setVistaCandidatos] = useState("En proceso");
useEffect(() => {
  console.log(
    "CANDIDATOS ACTUALIZADOS:",
    candidatos.map((c) => ({
      nombre: c.nombre,
      estado: c.estado,
    }))
  );
}, [candidatos]);
const contarCandidatos = (etapa) => {
  return candidatos.filter(
    (candidato) => candidato.estado === etapa
  ).length;
};
const [mostrarFormularioCandidato, setMostrarFormularioCandidato] = useState(false);

useEffect(() => {
  const cargarCandidatos = async () => {
    try {
      const candidatosGuardados = await obtenerCandidatos();
const nombresEtapas = {
  APLICACION: "Aplicación",
  REVISION_CV: "Referencias",
  ENTREVISTA: "Entrevista",
  EVALUACION: "Evaluación",
  OFERTA: "Oferta",
  CONTRATADO: "Contratado",
};
      const candidatosAdaptados = candidatosGuardados.map((candidato) => ({
        ...candidato,
        nombre: `${candidato.nombre} ${candidato.apellido}`.trim(),
        correo: candidato.email || "",
        puesto: candidato.puestoAplicado,
        cvArchivo: candidato.cvArchivo,
        fecha: candidato.fechaRegistro?.slice(0, 10) || "",
      
estado:
  candidato.estado === "DESCARTADO"
    ? "Descartado"
    : candidato.estado === "CONTRATADO"
      ? "Contratado"
      : nombresEtapas[candidato.etapa] || "Aplicación",

motivoDescarte: candidato.motivoDescarte || "",
fechaDescarte: candidato.fechaDescarte || null,

      puntuacion: candidato.evaluacion?.puntuacion ?? 0,
      oferta: candidato.oferta
  ? {
      id: candidato.oferta.id,
      tipoContrato: candidato.oferta.tipoContrato,
      salario: candidato.oferta.salario,
      fechaInicio: candidato.oferta.fechaInicio?.slice(0, 10) || "",
      estado:
        candidato.oferta.estado === "ACEPTADA"
          ? "Aceptada"
          : candidato.oferta.estado === "RECHAZADA"
          ? "Rechazada"
          : "Pendiente",
    }
  : null,
        evaluacion: candidato.evaluacion
  ? {
      id: candidato.evaluacion.id,
      puntuacion: candidato.evaluacion.puntuacion,
      clasificacion: candidato.evaluacion.clasificacion,
      observaciones: candidato.evaluacion.observaciones,
      resultado: candidato.evaluacion.resultado,
    }
  : null,
      entrevista: candidato.entrevistas?.length
  ? {
      id: candidato.entrevistas[0].id,
      estadoEntrevista:
  candidato.entrevistas[0].estadoEntrevista || "PENDIENTE",

fecha: candidato.entrevistas[0].fecha
  ? candidato.entrevistas[0].fecha.includes("T00:00:00")
    ? candidato.entrevistas[0].fecha.slice(0, 10)
    : new Date(candidato.entrevistas[0].fecha)
        .toLocaleDateString("sv-SE", {
          timeZone: "America/Tegucigalpa",
        })
  : "",

hora:
  candidato.entrevistas[0].fecha &&
  !candidato.entrevistas[0].fecha.includes("T00:00:00")
    ? new Date(candidato.entrevistas[0].fecha)
        .toLocaleTimeString("sv-SE", {
          timeZone: "America/Tegucigalpa",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
    : "",


      tipo:
        candidato.entrevistas[0].modalidad === "VIRTUAL"
          ? "Virtual"
          : candidato.entrevistas[0].modalidad === "TELEFONICA"
          ? "Telefónica"
          : "Presencial",

      indicaciones: candidato.entrevistas[0].indicaciones || "",

      observaciones: candidato.entrevistas[0].observaciones || "",

      resultado:
        candidato.entrevistas[0].resultado === "APROBADO"
          ? "Aprobado"
          : candidato.entrevistas[0].resultado === "REPROBADO"
          ? "Rechazado"
          : "Pendiente",

          documentoArchivo:
  candidato.entrevistas[0].documentoArchivo || null,
      documento: null,
    }
  : null,
      }));

      setCandidatos(candidatosAdaptados);
    } catch (error) {
      console.error("Error al cargar candidatos:", error);
    }
  };

  cargarCandidatos();
}, []);

const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null);

const guardarCandidato = async (nuevoCandidato) => {
  try {
    const datosBackend = {
      nombre: nuevoCandidato.nombre,
      apellido: nuevoCandidato.apellido,

identidad: nuevoCandidato.identidad,

      email: nuevoCandidato.correo,
      telefono: nuevoCandidato.telefono,

direccion: nuevoCandidato.direccion,
referencias: nuevoCandidato.referencias,

      puestoAplicado: nuevoCandidato.puesto,
      vacanteId: nuevoCandidato.vacanteId,
      cv: nuevoCandidato.cv,

foto: nuevoCandidato.foto,

    };

    const candidatoGuardado = await crearCandidato(datosBackend);

    setCandidatos((anteriores) => [
      ...anteriores,
      { ...nuevoCandidato, id: candidatoGuardado.id },
    ]);

    setMostrarFormularioCandidato(false);
  } catch (error) {
    console.error("Error al guardar candidato:", error);
    alert("No se pudo guardar el candidato. Revisa la conexión con el backend.");
  }
};

const actualizarCandidato = async (candidatoActualizado) => {

const etapasBackend = {
  "Aplicación": "APLICACION",
"Referencias": "REVISION_CV",
  "Entrevista": "ENTREVISTA",
  "Evaluación": "EVALUACION",
  "Oferta": "OFERTA",
  "Contratado": "CONTRATADO",
};


  try {

const etapaBackend = etapasBackend[candidatoActualizado.estado];

const cambios = candidatoActualizado.estado === "Rechazado"
  ? { estado: "DESCARTADO" }
  : {
      estado: candidatoActualizado.estado === "Contratado"
        ? "CONTRATADO"
        : "EN_PROCESO",
      etapa: etapaBackend,
    };

await actualizarEstadoCandidato(
  candidatoActualizado.id,
  cambios
);


    setCandidatos((anteriores) =>
      anteriores.map((candidato) =>
        candidato.id === candidatoActualizado.id
          ? candidatoActualizado
          : candidato
      )
    );

    setCandidatoSeleccionado(candidatoActualizado);
    return true;
  } catch (error) {
    console.error("Error al actualizar candidato:", error);
    alert("No se pudo actualizar el candidato.");
    return false;
  }
};
const [mostrarFormularioVacante, setMostrarFormularioVacante] = useState(false);
const [filtroVacantes, setFiltroVacantes] = useState("DISPONIBLE");

const [nuevaVacante, setNuevaVacante] = useState({
  nombre: "",
  areaId: "",
  descripcion: "",
  plazasTotales: 1,
});

const guardarVacante = async (evento) => {
  evento.preventDefault();

  if (
    !nuevaVacante.nombre.trim() ||
    !nuevaVacante.descripcion.trim() ||
    !nuevaVacante.areaId
  ) {
    return;
  }

  try {
    setGuardandoVacante(true);

   
const vacanteCreada = await crearVacante({
  nombre: nuevaVacante.nombre.trim(),
  areaId: Number(nuevaVacante.areaId),
  descripcion: nuevaVacante.descripcion.trim(),
  plazasTotales: Number(nuevaVacante.plazasTotales ?? 1),
});

    setVacantes((anteriores) => [vacanteCreada, ...anteriores]);

    setNuevaVacante({
      nombre: "",
      areaId: "",
      descripcion: "",
      plazasTotales: 1,
    });

    setMostrarFormularioVacante(false);
  } catch (error) {
    console.error("Error al guardar vacante:", error);
    alert(
      error.response?.data?.mensaje ||
        "No se pudo guardar la vacante. Revisa la conexión con el backend."
    );
  } finally {
    setGuardandoVacante(false);
  }
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
    <MainLayout>
    <main className="reclutamiento">
      <div className="reclutamiento-encabezado">
        <div>
          <p className="reclutamiento-subtitulo">
{candidatos.filter(
  (c) => c.estado !== "Contratado" &&
         c.estado !== "Descartado"
).length} candidatos activos — Vito Pizzería
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

      
<div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "18px",
    flexWrap: "wrap",
  }}
>
  {[
    { valor: "DISPONIBLE", texto: "Disponibles" },
    { valor: "CUBIERTA", texto: "Cubiertas" },
   
  ].map((opcion) => (
    <button
      key={opcion.valor}
      type="button"
      className={
        filtroVacantes === opcion.valor
          ? "reclutamiento-btn-principal"
          : "reclutamiento-btn-secundario"
      }
      aria-pressed={filtroVacantes === opcion.valor}
      onClick={() => setFiltroVacantes(opcion.valor)}
    >
      {opcion.texto}
    </button>
  ))}
</div>

<section className="reclutamiento-vacantes">
  {vacantes
    .filter(
      (vacante) => vacante.estadoVacante === filtroVacantes
    )
    .map((vacante) => (
      <article
        className="reclutamiento-vacante"
        key={vacante.id}
      >
        <span className="reclutamiento-etiqueta">
          {vacante.area?.nombre}
        </span>

        <h3>{vacante.nombre}</h3>
        <p>{vacante.descripcion}</p>

        <p style={{ marginTop: "12px", fontSize: "13px" }}>
          <strong>Plazas cubiertas:</strong>{" "}
          {vacante.plazasCubiertas ?? 0} de{" "}
          {vacante.plazasTotales ?? 1}
        </p>
      </article>
    ))}

  {vacantes.filter(
    (vacante) => vacante.estadoVacante === filtroVacantes
  ).length === 0 && (
    <p style={{ gridColumn: "1 / -1", color: "#64748b" }}>
      No hay vacantes en esta categoría.
    </p>
  )}
</section>



      <section className="reclutamiento-pipeline">
        <h2>PIPELINE DE SELECCIÓN</h2>

        <div className="reclutamiento-etapas">

          {etapas.map((etapa) => (
            <div className="reclutamiento-etapa" key={etapa}>
<strong>{contarCandidatos(etapa)}</strong>
              <span>{etapa}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="reclutamiento-lista">

      
<div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  }}
>
  {["En proceso", "Contratados", "Descartados"].map((vista) => (
    <button
      key={vista}
      type="button"
      onClick={() => setVistaCandidatos(vista)}
      style={{
        padding: "10px 18px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        cursor: "pointer",
        background:
          vistaCandidatos === vista ? "#ed3548" : "#fff",
        color:
          vistaCandidatos === vista ? "#fff" : "#333",
        fontWeight: "600",
      }}
    >
      {vista}
    </button>
  ))}
</div>


      
{candidatos
  .filter((candidato) => {
    if (vistaCandidatos === "Contratados") {
      return candidato.estado === "Contratado";
    }

    if (vistaCandidatos === "Descartados") {
      return candidato.estado === "Descartado";
    }

    return (
      candidato.estado !== "Contratado" &&
      candidato.estado !== "Descartado"
    );
  })
  .map((candidato) => (

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
          required
          value={nuevaVacante.areaId}
          onChange={(evento) =>
            setNuevaVacante({
              ...nuevaVacante,
              areaId: evento.target.value,
            })
          }
        >
          <option value="">Selecciona un área</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nombre}
            </option>
          ))}
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


<label htmlFor="vacante-plazas">NÚMERO DE PLAZAS</label>
<input
  id="vacante-plazas"
  type="number"
  min="1"
  step="1"
  required
  value={nuevaVacante.plazasTotales}
  onChange={(evento) =>
    setNuevaVacante({
      ...nuevaVacante,
      plazasTotales: evento.target.value,
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

          <button
            type="submit"
            className="reclutamiento-btn-principal"
            disabled={guardandoVacante}
          >
            {guardandoVacante ? "Guardando..." : "Guardar vacante"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{mostrarFormularioCandidato && (
  <FormularioCandidato
   vacantes={vacantes.filter(
  (vacante) =>
    vacante.estadoVacante === "DISPONIBLE"
)}
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
     </MainLayout>
  );

}