
import { useEffect, useState } from "react";
import "./PerfilCandidato.css";
import {
  crearEntrevista,
  actualizarEntrevista,
  cambiarEstadoEntrevista,
  subirDocumentoEntrevista,
  obtenerDocumentoEntrevista,
  obtenerFoto,
  guardarEvaluacion as guardarEvaluacionEnServidor,
  guardarOferta as guardarOfertaEnServidor,
  responderOferta as responderOfertaEnServidor,
  descartarCandidato as descartarCandidatoEnServidor,
  obtenerCatalogosContratacion,
contratarCandidato as contratarCandidatoEnServidor,
obtenerCV,
} from "../services/reclutamientoService";

const secciones = [
  "Información",
  "Referencias",
  "Entrevista",
  "Evaluación",
  "Oferta",
  "Contratación",
];

export default function PerfilCandidato({
  candidato,
  onActualizar,
  onCerrar,
}) {
  const [paso, setPaso] = useState(0);



const [fotoUrl, setFotoUrl] = useState(null);

useEffect(() => {
  let cancelado = false;
  let urlTemporal = null;

  setFotoUrl(null);

  if (candidato.fotoArchivo) {
    obtenerFoto(candidato.id)
      .then((archivo) => {
        if (cancelado) return;

        urlTemporal = URL.createObjectURL(archivo);
        setFotoUrl(urlTemporal);
      })
      .catch((error) => {
        console.error("Error al cargar fotografía:", error);
      });
  }

  return () => {
    cancelado = true;
    if (urlTemporal) {
      URL.revokeObjectURL(urlTemporal);
    }
  };
}, [candidato.id, candidato.fotoArchivo]);



const abrirCV = async () => {
  const ventana = window.open("", "_blank");

  if (!ventana) {
    alert("Permite las ventanas emergentes para ver el CV.");
    return;
  }

  ventana.opener = null;

  try {
    const archivo = await obtenerCV(candidato.id);
    const url = URL.createObjectURL(archivo);

    ventana.location.href = url;

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    ventana.close();
    console.error("Error al abrir CV:", error);

    alert(
      error.response?.data?.mensaje ||
      "No se pudo abrir el CV."
    );
  }
};


const [mostrarFormularioContratacion, setMostrarFormularioContratacion] =
  useState(false);

const [areasContratacion, setAreasContratacion] = useState([]);
const [cargandoContratacion, setCargandoContratacion] = useState(false);
const [guardandoContratacion, setGuardandoContratacion] = useState(false);

const [datosContratacion, setDatosContratacion] = useState({
  identidad: "",
  telefono: "",
  correo: "",
  areaId: "",
  puestoId: "",
});

const abrirFormularioContratacion = async () => {
  try {
    setCargandoContratacion(true);

    const areas = await obtenerCatalogosContratacion();

    setAreasContratacion(areas);
    setDatosContratacion({
     
      identidad: candidato.identidad || "",

      telefono: candidato.telefono || "",
      correo: candidato.correo || candidato.email || "",
      areaId: "",
      puestoId: "",
    });

    setMostrarFormularioContratacion(true);
  } catch (error) {
    alert(
      error.response?.data?.mensaje ||
      "No se pudieron cargar las áreas y puestos."
    );
  } finally {
    setCargandoContratacion(false);
  }
};



const confirmarContratacion = async (e) => {
  e.preventDefault();

  if (guardandoContratacion) return;

  const { identidad, telefono, correo, areaId, puestoId } =
    datosContratacion;

  if (
    !identidad.trim() ||
    !telefono.trim() ||
    !correo.trim() ||
    !areaId ||
    !puestoId
  ) {
    alert("Debes completar todos los campos.");
    return;
  }

  const confirmado = window.confirm(
    `¿Deseas contratar a ${candidato.nombre} ${candidato.apellido} y registrarlo como empleado?`
  );

  if (!confirmado) return;

  try {
    setGuardandoContratacion(true);

    await contratarCandidatoEnServidor(candidato.id, {
      identidad: identidad.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      areaId: Number(areaId),
      puestoId: Number(puestoId),
    });

    alert("¡Candidato contratado y registrado como empleado!");

    
setMostrarFormularioContratacion(false);
onCerrar?.();
window.location.reload();

  } catch (error) {
    alert(
      error.response?.data?.mensaje ||
      "No se pudo registrar la contratación."
    );
  } finally {
    setGuardandoContratacion(false);
  }
};



const [descartando, setDescartando] = useState(false);

const registrarDescarte = async () => {
  if (
    candidato.estado === "Contratado" ||
    candidato.estado === "Descartado" ||
    descartando
  ) {
    return;
  }

  const respuesta = window.prompt(
    "Escribe el motivo por el que deseas descartar al candidato:"
  );

  if (respuesta === null) return;

  const motivo = respuesta.trim();

  if (motivo.length < 5 || motivo.length > 500) {
    alert("El motivo debe tener entre 5 y 500 caracteres.");
    return;
  }

  const confirmado = window.confirm(
    `¿Estás segura de descartar a ${candidato.nombre} ${candidato.apellido}?\n\nMotivo: ${motivo}`
  );

  if (!confirmado) return;

  try {
    setDescartando(true);

    await descartarCandidatoEnServidor(candidato.id, motivo);

    alert("Candidato descartado correctamente.");

    // await onActualizar?.();
    onCerrar?.();
    window.location.reload();
  } catch (error) {
    alert(
      error.response?.data?.mensaje ||
      "No se pudo descartar al candidato."
    );
  } finally {
    setDescartando(false);
  }
};


  const [oferta, setOferta] = useState(
  candidato.oferta || {
    tipoContrato: "Término fijo",
    salario: "",
    fechaInicio: "",
    estado: "Pendiente",
  }
);

const [editandoOferta, setEditandoOferta] = useState(false);
const [entrevista, setEntrevista] = useState(
  candidato.entrevista || {
    fecha: "",
    tipo: "Presencial",
    observaciones: "",
    resultado: "Pendiente",
    documento: null,
  }
);

const [editandoEntrevista, setEditandoEntrevista] = useState(false);
const [evaluacion, setEvaluacion] = useState({
  puntuacion: candidato.evaluacion?.puntuacion ?? candidato.puntuacion ?? 0,
  clasificacion: candidato.evaluacion?.clasificacion ?? "Informativo",
  observaciones: candidato.evaluacion?.observaciones ?? "",
  resultado: candidato.evaluacion?.resultado ?? "PENDIENTE",
});

const [editandoEvaluacion, setEditandoEvaluacion] = useState(false);
const guardarEntrevista = async () => {
 
if (
  !entrevista.fecha ||
  !entrevista.hora ||
  !entrevista.indicaciones?.trim()
) {
  alert("Completa la fecha, hora e indicaciones de la entrevista.");
  return;
}

const fechaHora = new Date(
  `${entrevista.fecha}T${entrevista.hora}:00`
);

if (Number.isNaN(fechaHora.getTime())) {
  alert("La fecha u hora de la entrevista no es válida.");
  return;
}

if (
  (entrevista.estadoEntrevista || "PENDIENTE") === "PENDIENTE" &&
  fechaHora.getTime() <= Date.now()
) {
  alert("La entrevista pendiente debe programarse para una fecha y hora futura.");
  return;


}

  try {
   
const datosEntrevista = {
 fecha: entrevista.hora
  ? new Date(
      `${entrevista.fecha}T${entrevista.hora}:00`
    ).toISOString()
  : entrevista.fecha,
  fase: 1,
  modalidad:
    entrevista.tipo === "Telefónica"
      ? "TELEFONICA"
      : entrevista.tipo.toUpperCase(),
  indicaciones: entrevista.indicaciones?.trim() || "",
  observaciones: entrevista.observaciones.trim(),
  resultado:
    entrevista.resultado === "Rechazado"
      ? "REPROBADO"
      : entrevista.resultado.toUpperCase(),
};

const guardada = entrevista.id
  ? await actualizarEntrevista(candidato.id, entrevista.id, datosEntrevista)
  : await crearEntrevista(candidato.id, datosEntrevista);

const entrevistaActualizada = {
  ...entrevista,
  id: guardada.id,
  observaciones: entrevista.observaciones.trim(),
};

setEntrevista(entrevistaActualizada);

onActualizar({
  ...candidato,
  entrevista: entrevistaActualizada,
});



if (entrevista.documento instanceof File) {
  try {
    await subirDocumentoEntrevista(
      candidato.id,
      guardada.id,
      entrevista.documento
    );
  } catch (errorDocumento) {
    console.error(
      "Error al subir el documento:",
      errorDocumento
    );

    alert(
      "Los datos de la entrevista se guardaron, pero el documento no pudo subirse."
    );

    setEditandoEntrevista(false);
    return;
  }
}



    setEditandoEntrevista(false);
    alert("Entrevista guardada correctamente.");
  } catch (error) {
    console.error("Error al guardar entrevista:", error);
    alert(
      error.response?.data?.mensaje ||
      "No se pudo guardar la entrevista. Verifica que hayas iniciado sesión."
    );
  }
};


const marcarEstadoEntrevista = async (nuevoEstado) => {
  const entrevistaId = entrevista.id || candidato.entrevista?.id;

  if (!entrevistaId) {
    alert("Primero debes guardar la entrevista.");
    return;
  }

  if ((entrevista.estadoEntrevista || "PENDIENTE") !== "PENDIENTE") {
    alert("Esta entrevista ya fue realizada o cancelada.");
    return;
  }

  const confirmar = window.confirm(
    nuevoEstado === "REALIZADA"
      ? "¿Confirmas que la entrevista ya se realizó?"
      : "¿Confirmas que deseas cancelar esta entrevista?"
  );

  if (!confirmar) return;

  try {
    const respuesta = await cambiarEstadoEntrevista(
      candidato.id,
      entrevistaId,
      nuevoEstado
    );

    const entrevistaActualizada = {
      ...entrevista,
      id: entrevistaId,
      estadoEntrevista: respuesta.estadoEntrevista,
    };

    setEntrevista(entrevistaActualizada);

    onActualizar({
      ...candidato,
      entrevista: entrevistaActualizada,
    });

    alert("Estado de entrevista actualizado correctamente.");
  } catch (error) {
    console.error("Error al cambiar estado de entrevista:", error);

    alert(
      error.response?.data?.mensaje ||
      "No se pudo actualizar el estado de la entrevista."
    );
  }
};

const abrirDocumentoEntrevista = async () => {
  const entrevistaId = candidato.entrevista?.id;

  if (!entrevistaId) {
    alert("No se encontró la entrevista.");
    return;
  }

  const ventana = window.open("", "_blank");

  if (!ventana) {
    alert("Permite las ventanas emergentes para ver el documento.");
    return;
  }

  ventana.opener = null;

  try {
    const archivo = await obtenerDocumentoEntrevista(
      candidato.id,
      entrevistaId
    );

    const url = URL.createObjectURL(archivo);
    ventana.location.href = url;

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    ventana.close();
    console.error("Error al abrir documento:", error);

    alert(
      error.response?.data?.mensaje ||
      "No se pudo abrir el documento."
    );
  }
};


const guardarEvaluacion = async () => {
  const puntuacion = Number(evaluacion.puntuacion);

  if (
    !Number.isInteger(puntuacion) ||
    puntuacion < 1 ||
    puntuacion > 10
  ) {
    alert("La puntuación debe ser un número entero entre 1 y 10.");
    return;
  }

  if (
    typeof evaluacion.observaciones !== "string" ||
    !evaluacion.observaciones.trim()
  ) {
    alert("Debes escribir las observaciones de la evaluación.");
    return;
  }

  const datosEvaluacion = {
    puntuacion,
    clasificacion: evaluacion.clasificacion,
    observaciones: evaluacion.observaciones.trim(),
    resultado: evaluacion.resultado || "PENDIENTE",
  };

  try {
    const guardada = await guardarEvaluacionEnServidor(
      candidato.id,
      datosEvaluacion
    );

    const evaluacionActualizada = {
      ...evaluacion,
      ...guardada,
    };

    setEvaluacion(evaluacionActualizada);

    onActualizar({
      ...candidato,
      puntuacion: guardada.puntuacion,
      evaluacion: evaluacionActualizada,
    });

    setEditandoEvaluacion(false);

    alert("Evaluación guardada correctamente.");
  } catch (error) {
    console.error("Error al guardar evaluación:", error);

    alert(
      error.response?.data?.mensaje ||
      "No se pudo guardar la evaluación."
    );
  }
};


const guardarOferta = async () => {
  const salario = Number(oferta.salario);

  if (
    !Number.isFinite(salario) ||
    salario <= 0 ||
    !oferta.fechaInicio
  ) {
    alert("Completa un salario válido y la fecha de inicio.");
    return;
  }

  try {
    const guardada = await guardarOfertaEnServidor(
      candidato.id,
      {
        tipoContrato: oferta.tipoContrato,
        salario: String(oferta.salario),
        fechaInicio: oferta.fechaInicio,
      }
    );

    const ofertaActualizada = {
      ...oferta,
      id: guardada.id,
      salario: guardada.salario,
      fechaInicio: guardada.fechaInicio.slice(0, 10),
      estado: "Pendiente",
    };

    setOferta(ofertaActualizada);

    onActualizar({
      ...candidato,
      oferta: ofertaActualizada,
    });

    setEditandoOferta(false);
    alert("Oferta guardada correctamente.");
  } catch (error) {
    console.error("Error al guardar oferta:", error);

    alert(
      error.response?.data?.mensaje ||
      "No se pudo guardar la oferta."
    );
  }
};



const responderOferta = async (respuesta) => {
  if (
    !candidato.oferta ||
    candidato.estado !== "Oferta" ||
    candidato.oferta.estado !== "Pendiente"
  ) {
    alert("No hay una oferta pendiente para responder.");
    return;
  }

  const confirmar = window.confirm(
    `¿Confirmas que el candidato ${respuesta.toLowerCase()} la oferta?`
  );

  if (!confirmar) return;

  try {
    const codigoRespuesta =
      respuesta === "Aceptada" ? "ACEPTADA" : "RECHAZADA";

    const ofertaGuardada = await responderOfertaEnServidor(
      candidato.id,
      codigoRespuesta
    );

    const ofertaActualizada = {
      ...candidato.oferta,
      estado:
        ofertaGuardada.estado === "ACEPTADA"
          ? "Aceptada"
          : "Rechazada",
      fechaRespuesta: ofertaGuardada.fechaRespuesta,
    };

    setOferta(ofertaActualizada);

    onActualizar({
      ...candidato,
      oferta: ofertaActualizada,
    });

    alert("Respuesta de la oferta registrada correctamente.");
  } catch (error) {
    console.error("Error al responder oferta:", error);

    alert(
      error.response?.data?.mensaje ||
      "No se pudo registrar la respuesta de la oferta."
    );
  }
};



const etapasSeleccion = [
  "Aplicación",
 "Referencias",
  "Entrevista",
  "Evaluación",
  "Oferta",
  "Contratado",
];


const avanzarEtapa = async () => {
  const indiceActual = etapasSeleccion.indexOf(candidato.estado);

  if (indiceActual < 0 || indiceActual >= 4) return;

  const siguienteEtapa = etapasSeleccion[indiceActual + 1];

  if (
    siguienteEtapa === "Evaluación" &&
    candidato.entrevista?.estadoEntrevista !== "REALIZADA"
  ) {
    alert("Primero debes completar la entrevista.");
    return;
  }

  
if (
  siguienteEtapa === "Oferta" &&
  candidato.evaluacion?.resultado !== "APROBADO"
) {
  if (candidato.evaluacion?.resultado === "REPROBADO") {
    alert(
      "No es posible avanzar a Oferta porque el candidato no aprobó la evaluación. Puedes mantenerlo en esta etapa o descartarlo registrando el motivo."
    );
  } else {
    alert(
      "La evaluación aún no ha sido completada. Registra el resultado antes de avanzar a la etapa de Oferta."
    );
  }
  return;
}



  const guardado = await onActualizar({
    ...candidato,
    estado: siguienteEtapa,
  });

  if (guardado === true) {
    setPaso(indiceActual + 1);
  }
};



const retrocederEtapa = async () => {
  const indiceActual = etapasSeleccion.indexOf(candidato.estado);

  if (
    indiceActual <= 0 ||
    candidato.estado === "Contratado" ||
    candidato.estado === "Descartado"
  ) {
    return;
  }

  const etapaAnterior = etapasSeleccion[indiceActual - 1];

  const confirmado = window.confirm(
    `¿Deseas retroceder a ${candidato.nombre} a la etapa "${etapaAnterior}"?\n\nLa información registrada se conservará.`
  );

  if (!confirmado) return;

  const guardado = await onActualizar({
    ...candidato,
    estado: etapaAnterior,
  });

  if (guardado === true) {
    setPaso(indiceActual - 1);
  }
};




  const iniciales = candidato.nombre
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return (
    <div className="pc-fondo" onClick={onCerrar}>
      <div
        className="pc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pc-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="pc-titulo">
          <h2 id="pc-titulo">Perfil del Candidato</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="pc-cuerpo">
          <div className="pc-candidato">
           
<div className="pc-avatar">
  {fotoUrl ? (
    <img
      src={fotoUrl}
      alt={`Fotografía de ${candidato.nombre}`}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "50%",
      }}
    />
  ) : (
    iniciales
  )}
</div>


            <div className="pc-identidad">
              <h3>{candidato.nombre}</h3>
              <p>
                {candidato.puesto} · {candidato.correo || "Sin correo"} ·{" "}
                {candidato.telefono || "Sin teléfono"}
              </p>
              <span className="pc-estado">{candidato.estado}</span>
            </div>

       
<button
  type="button"
  className="pc-boton-secundario"
  onClick={retrocederEtapa}
  disabled={
    etapasSeleccion.indexOf(candidato.estado) <= 0 ||
    candidato.estado === "Contratado" ||
    candidato.estado === "Descartado"
  }
>
  ← Retroceder etapa
</button>
</div>

          <div className="pc-pasos">
            {secciones.map((seccion, indice) => (
              <button
                type="button"
                key={seccion}
                className={`pc-paso ${paso === indice ? "activo" : ""}`}
                onClick={() => setPaso(indice)}
              >
                <strong>{indice + 1}</strong>
                <span>{seccion}</span>
              </button>
            ))}
          </div>

          <div className="pc-contenido">
            {paso === 0 && (
              <div className="pc-datos">
                <div>
                  <small>Correo</small>
                  <strong>{candidato.correo || "No registrado"}</strong>
                </div>

                <div>
                  <small>Teléfono</small>
                  <strong>{candidato.telefono || "No registrado"}</strong>
                </div>

                <div>
                  <small>Fecha de aplicación</small>
                  <strong>{candidato.fecha || "No registrada"}</strong>
                </div>

                <div>
                  <small>Puesto</small>
                  <strong>{candidato.puesto}</strong>
                </div>

               
<div className="pc-ancho-completo">
  <small>Dirección</small>
  <strong>{candidato.direccion || "No registrada"}</strong>
</div>


                <div className="pc-ancho-completo">
                  <small>Currículum</small>
                 {(candidato.cv || candidato.cvArchivo) ? (
                       
<button
  type="button"
  onClick={abrirCV}
  style={{
    background: "none",
    border: "none",
    color: "#2563eb",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
  }}
>
  Ver CV
</button>

                  ) : (
                    <strong>No hay CV adjunto</strong>
                  )}
                </div>
              </div>
            )}

            {paso === 1 && (
              <div className="pc-datos">
                <div className="pc-ancho-completo">
                  <small>Referencia personal / laboral</small>
                  <strong>{candidato.referencias || "No registrada"}</strong>
                </div>

                
              </div>
            )}

 {paso === 2 && (
  <div className="pc-panel">
    <h3>Entrevista del candidato</h3>

    {editandoEntrevista ? (
      <div className="pc-formulario-oferta">
        <label>
          FECHA DE ENTREVISTA
          <input
            type="date"
            value={entrevista.fecha}
            onChange={(e) =>
              setEntrevista({
                ...entrevista,
                fecha: e.target.value,
              })
            }
          />
        </label>


<label>
  HORA DE ENTREVISTA
  <input
    type="time"
    value={entrevista.hora || ""}
    onChange={(e) =>
      setEntrevista({
        ...entrevista,
        hora: e.target.value,
      })
    }
  />
</label>



        <label>
          TIPO DE ENTREVISTA
          <select
            value={entrevista.tipo}
            onChange={(e) =>
              setEntrevista({
                ...entrevista,
                tipo: e.target.value,
              })
            }
          >
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
            <option value="Telefónica">Telefónica</option>
          </select>
        </label>

<label>
  INDICACIONES PARA LA ENTREVISTA
  <textarea
    rows="3"
    value={entrevista.indicaciones || ""}
    onChange={(e) =>
      setEntrevista({
        ...entrevista,
        indicaciones: e.target.value,
      })
    }
    placeholder={
      entrevista.tipo === "Presencial"
        ? "Escribe la dirección donde se realizará la entrevista..."
        : entrevista.tipo === "Virtual"
        ? "Escribe el enlace y las instrucciones para ingresar a la reunión..."
        : "Escribe el número de teléfono y las instrucciones para la llamada..."
    }
  />
</label>


  
<label>
  DOCUMENTO DE ENTREVISTA (PDF O IMAGEN)
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) => {
      const archivo = e.target.files?.[0];

      if (!archivo) return;

      if (
        ![
          "application/pdf",
          "image/jpeg",
          "image/png",
        ].includes(archivo.type)
      ) {
        alert("Selecciona un archivo PDF, JPG o PNG.");
        e.target.value = "";
        return;
      }

      setEntrevista({
        ...entrevista,
        documento: archivo,
      });
    }}
  />
</label>

{entrevista.documento && (
  <p>
    Documento seleccionado: {entrevista.documento.name}
  </p>
)}
        

        <div className="pc-botones-oferta">
          <button
            type="button"
            onClick={() => setEditandoEntrevista(false)}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="pc-boton-principal"
            onClick={guardarEntrevista}
          >
            Guardar entrevista
          </button>
        </div>
      </div>
    ) : candidato.entrevista ? (
      <div>
        <p><strong>Fecha:</strong> {candidato.entrevista.fecha}</p>
        <p>
  <strong>Hora:</strong>{" "}
  {candidato.entrevista.hora || "No registrada"}
</p>
        <p><strong>Tipo:</strong> {candidato.entrevista.tipo}</p>
        {candidato.entrevista.indicaciones && (
  <p>
    <strong>Indicaciones:</strong>{" "}
    {candidato.entrevista.indicaciones}
  </p>
)}
   
   
<p>
  <strong>Estado de entrevista:</strong>{" "}
  {candidato.entrevista.estadoEntrevista === "REALIZADA"
    ? "Realizada"
    : candidato.entrevista.estadoEntrevista === "CANCELADA"
    ? "Cancelada"
    : "Pendiente"}
</p>


{candidato.estado !== "Descartado" &&
  candidato.estado !== "Contratado" &&
  (candidato.entrevista.estadoEntrevista || "PENDIENTE") ===
    "PENDIENTE" && (

  <div className="pc-botones-oferta">
    <button
      type="button"
      className="pc-boton-principal"
      onClick={() => marcarEstadoEntrevista("REALIZADA")}
    >
      Marcar como realizada
    </button>

    <button
      type="button"
      onClick={() => marcarEstadoEntrevista("CANCELADA")}
    >
      Cancelar entrevista
    </button>
  </div>
)}




{candidato.entrevista.documentoArchivo && (
  <div className="pc-documento-entrevista">
    <p>
      <strong>Documento de entrevista</strong>
    </p>

    <p>Archivo adjunto</p>

    <button
      type="button"
      onClick={abrirDocumentoEntrevista}
    >
      Ver documento
    </button>
  </div>
)}




       

{candidato.estado !== "Descartado" &&
  candidato.estado !== "Contratado" &&
  (candidato.entrevista.estadoEntrevista || "PENDIENTE") ===
    "PENDIENTE" && (

  <button
    type="button"
    className="pc-boton-principal"
    onClick={() => setEditandoEntrevista(true)}
  >
    Modificar entrevista
  </button>
)}

      </div>
    ) : (
      <div>
        <p>Este candidato todavía no tiene una entrevista registrada.</p>

{candidato.estado !== "Descartado" && candidato.estado !== "Contratado" && (

        <button
          type="button"

          className="pc-boton-principal"
          onClick={() => setEditandoEntrevista(true)}
        >
          + Registrar entrevista
        </button>
        )}
      </div>
    )}
  </div>
)}

      {paso === 3 && (
  <div className="pc-panel">
    <h3>Evaluación del candidato</h3>

    {editandoEvaluacion ? (
      <div className="pc-formulario-oferta">
        <label>
          PUNTUACIÓN (1 A 10)
          <input
            type="number"
            min="1"
            max="10"
            step="1"
            value={evaluacion.puntuacion}
            onChange={(e) =>
              setEvaluacion({
                ...evaluacion,
                puntuacion: e.target.value,
              })
            }
          />
        </label>

    

<label>
  RESULTADO DE LA EVALUACIÓN
  <select
    value={evaluacion.resultado}
    onChange={(e) =>
      setEvaluacion({
        ...evaluacion,
        resultado: e.target.value,
      })
    }
  >
    <option value="PENDIENTE">Pendiente</option>
    <option value="APROBADO">Aprobado</option>
    <option value="REPROBADO">Reprobado</option>
  </select>
</label>

        <label>
          OBSERVACIONES
          <textarea
            rows="4"
            value={evaluacion.observaciones}
            onChange={(e) =>
              setEvaluacion({
                ...evaluacion,
                observaciones: e.target.value,
              })
            }
            placeholder="Describe las competencias, experiencia y desempeño..."
          />
        </label>

        <div className="pc-botones-oferta">
          <button
            type="button"
            onClick={() => setEditandoEvaluacion(false)}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="pc-boton-principal"
            onClick={guardarEvaluacion}
          >
            Guardar evaluación
          </button>
        </div>
      </div>
    ) : (
      <>
        <div className="pc-evaluacion">
          <strong>
            {candidato.evaluacion?.puntuacion ??
              candidato.puntuacion ??
              0}/10
          </strong>

          <div>
            <b>Resultado registrado</b>
            <p>Competencias, experiencia y ajuste al cargo.</p>
          </div>
        </div>

        <div className="pc-detalles-evaluacion">
         

<p>
  <strong>Resultado:</strong>{" "}
  {candidato.evaluacion?.resultado === "APROBADO"
    ? "Aprobado"
    : candidato.evaluacion?.resultado === "REPROBADO"
    ? "Reprobado"
    : "Pendiente"}
</p>

          <p>
            <strong>Observaciones:</strong>{" "}
            {candidato.evaluacion?.observaciones || "Sin observaciones"}
          </p>
        </div>

{candidato.estado !== "Descartado" && candidato.estado !== "Contratado" && (

       <button
       type="button"
       className="pc-boton-principal"
       disabled={
      candidato.entrevista?.estadoEntrevista !== "REALIZADA"
  }    
      onClick={() => setEditandoEvaluacion(true)}
>
      Modificar evaluación
      </button>

)}

      {candidato.entrevista?.estadoEntrevista !== "REALIZADA" && (
  <p>
    Primero debes realizar la entrevista para evaluar al candidato.
  </p>
)}
      </>
    )}
  </div>
)}

           
{paso === 4 && (
  <div className="pc-panel">
    <h3>Oferta laboral · {candidato.puesto}</h3>

    {editandoOferta ? (
      <div className="pc-formulario-oferta">
        <label>
          TIPO DE CONTRATO
          <select
            value={oferta.tipoContrato}
            onChange={(e) =>
              setOferta({ ...oferta, tipoContrato: e.target.value })
            }
          >
            <option value="Término fijo">Término fijo</option>
            <option value="Indefinido">Indefinido</option>
            <option value="Temporal">Temporal</option>
          </select>
        </label>

        <label>
          SALARIO MENSUAL (L)
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Ejemplo: 15000"
            value={oferta.salario}
            onChange={(e) =>
              setOferta({ ...oferta, salario: e.target.value })
            }
          />
        </label>

        <label>
          FECHA DE INICIO
          <input
            type="date"
            value={oferta.fechaInicio}
            onChange={(e) =>
              setOferta({ ...oferta, fechaInicio: e.target.value })
            }
          />
        </label>

        <div className="pc-botones-oferta">
          <button
            type="button"
            onClick={() => {
              setOferta(
                candidato.oferta || {
                  tipoContrato: "Término fijo",
                  salario: "",
                  fechaInicio: "",
                  estado: "Pendiente",
                }
              );
              setEditandoOferta(false);
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="pc-boton-principal"
            onClick={guardarOferta}
          >
            Guardar oferta
          </button>
        </div>
      </div>
    ) : candidato.oferta ? (
      <>
        <div className="pc-datos">
          <div>
            <small>Tipo de contrato</small>
            <strong>{candidato.oferta.tipoContrato}</strong>
          </div>

          <div>
            <small>Salario mensual</small>
            <strong>
              L {Number(candidato.oferta.salario).toLocaleString("es-HN")}
            </strong>
          </div>

          <div>
            <small>Fecha de inicio</small>
            <strong>{candidato.oferta.fechaInicio}</strong>
          </div>

          <div>
            <small>Estado de la oferta</small>
            <strong>{candidato.oferta.estado}</strong>
          </div>
        </div>

        <div className="pc-botones-oferta">
          <button
            type="button"
            onClick={() => setEditandoOferta(true)}
            disabled={candidato.oferta?.estado !== "Pendiente"}
          >
            Modificar oferta
          </button>

        <button
  type="button"
  disabled={
    candidato.estado !== "Oferta" ||
    candidato.oferta.estado !== "Pendiente"
  }
  onClick={() => responderOferta("Aceptada")}
>
  Aceptar oferta
</button>

<button
  type="button"
  disabled={
    candidato.estado !== "Oferta" ||
    candidato.oferta.estado !== "Pendiente"
  }
  onClick={() => responderOferta("Rechazada")}
>
  Rechazar oferta
</button>

        
        </div>
      </>
    ) : (
      <>
        <p>
          Este candidato todavía no tiene una oferta laboral registrada.
        </p>

        <button
          type="button"
          className="pc-boton-principal"
          onClick={() => setEditandoOferta(true)}
        >
          + Crear oferta
        </button>
      </>
    )}
  </div>
)}


{paso === 5 && (
  <div className="pc-contratacion">
    <div className="pc-check">✓</div>

    <h3>Decisión final del candidato</h3>

    
{candidato.estado === "Descartado" && (
  <div
    style={{
      padding: "15px",
      margin: "15px 0",
      background: "#fff1f2",
      borderRadius: "8px",
      textAlign: "left",
    }}
  >
    <strong>Motivo del descarte:</strong>
    <p>{candidato.motivoDescarte || "No registrado"}</p>

    {candidato.fechaDescarte && (
      <small>
        Fecha:{" "}
        {new Date(candidato.fechaDescarte).toLocaleDateString(
          "es-HN",
          { timeZone: "America/Tegucigalpa" }
        )}
      </small>
    )}
  </div>
)}


    <p>
      Selecciona si el candidato será contratado
      o descartado del proceso de selección.
    </p>

    <div
      style={{
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
     
<button
  type="button"
  className="pc-boton-principal"
  style={{ display: mostrarFormularioContratacion ? "none" : undefined }}
  disabled={
    cargandoContratacion ||
    guardandoContratacion ||
    candidato.estado !== "Oferta" ||
    candidato.oferta?.estado !== "Aceptada"
  }
  onClick={abrirFormularioContratacion}
>
  {cargandoContratacion
    ? "Cargando..."
    : "Contratar candidato"}
</button>


      <button
        type="button"
        className="pc-boton-secundario"
        style={{ display: mostrarFormularioContratacion ? "none" : undefined }}
        disabled={
  descartando ||
  candidato.estado === "Contratado" ||
  candidato.estado === "Descartado"
}
       onClick={registrarDescarte}
      >
        Descartar candidato
      </button>
    </div>
  </div>
)}



{mostrarFormularioContratacion && (
  <form
    onSubmit={confirmarContratacion}
    className="pc-contratacion-formulario"
  >
    <div className="pc-contratacion-encabezado">
      <h3>Registro de contratación</h3>
      <p>
        Completa los datos para registrar al nuevo empleado.
      </p>
    </div>

    <div className="pc-contratacion-grid">
      <label className="pc-contratacion-campo">
        <span>Identidad</span>
        <input
          type="text"
          required
          value={datosContratacion.identidad}
          onChange={(e) =>
            setDatosContratacion({
              ...datosContratacion,
              identidad: e.target.value,
            })
          }
          placeholder="Número de identidad"
        />
      </label>

      <label className="pc-contratacion-campo">
        <span>Teléfono</span>
        <input
          type="tel"
          required
          value={datosContratacion.telefono}
          onChange={(e) =>
            setDatosContratacion({
              ...datosContratacion,
              telefono: e.target.value,
            })
          }
        />
      </label>

      <label className="pc-contratacion-campo">
        <span>Correo electrónico</span>
        <input
          type="email"
          required
          value={datosContratacion.correo}
          onChange={(e) =>
            setDatosContratacion({
              ...datosContratacion,
              correo: e.target.value,
            })
          }
        />
      </label>

      <label className="pc-contratacion-campo">
        <span>Área</span>
        <select
          required
          value={datosContratacion.areaId}
          onChange={(e) =>
            setDatosContratacion({
              ...datosContratacion,
              areaId: e.target.value,
              puestoId: "",
            })
          }
        >
          <option value="">Selecciona un área</option>
          {areasContratacion.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="pc-contratacion-campo">
        <span>Puesto</span>
        <select
          required
          value={datosContratacion.puestoId}
          disabled={!datosContratacion.areaId}
          onChange={(e) =>
            setDatosContratacion({
              ...datosContratacion,
              puestoId: e.target.value,
            })
          }
        >
          <option value="">Selecciona un puesto</option>
          {(
            areasContratacion.find(
              (area) =>
                String(area.id) ===
                String(datosContratacion.areaId)
            )?.puestos || []
          ).map((puesto) => (
            <option key={puesto.id} value={puesto.id}>
              {puesto.nombre}
            </option>
          ))}
        </select>
      </label>
    </div>

    <div className="pc-contratacion-resumen">
      <div>
        <span>Salario ofrecido</span>
        <strong>
          L{" "}
          {Number(
            candidato.oferta?.salario || 0
          ).toLocaleString("es-HN")}
        </strong>
      </div>

      <div>
        <span>Fecha de ingreso</span>
        <strong>
          {candidato.oferta?.fechaInicio
            ? new Date(
                candidato.oferta.fechaInicio
              ).toLocaleDateString("es-HN", {
                timeZone: "UTC",
              })
            : "No registrada"}
        </strong>
      </div>
    </div>

    <div className="pc-contratacion-botones">
      <button
        type="submit"
        className="pc-boton-principal"
        disabled={guardandoContratacion}
      >
        {guardandoContratacion
          ? "Registrando..."
          : "Confirmar contratación"}
      </button>

      <button
        type="button"
        className="pc-boton-secundario"
        disabled={guardandoContratacion}
        onClick={() =>
          setMostrarFormularioContratacion(false)
        }
      >
        Cancelar
      </button>
    </div>
  </form>
)}




  

          </div>

          <div className="pc-acciones">
            <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="pc-boton-secundario"
              disabled={paso === 0}
              onClick={() => setPaso(paso - 1)}
              
            >
              ← Anterior
            </button>


<button
  type="button"
  className="pc-boton-secundario"
  disabled={paso === 5}
  onClick={() => setPaso(paso + 1)}
>
  Siguiente →
</button>

</div>




            <div className="pc-acciones-derecha">
             

              

{paso !== 5 &&
  paso === etapasSeleccion.indexOf(candidato.estado) &&
  candidato.estado !== "Contratado" &&
  candidato.estado !== "Descartado" && (

    <button
      type="button"
      className="pc-boton-secundario"
      disabled={descartando}
      onClick={registrarDescarte}
    >
      {descartando ? "Descartando..." : "Descartar candidato"}
    </button>
  )}


{paso === 4 &&
  candidato.estado === "Oferta" &&
  candidato.oferta?.estado === "Aceptada" && (
    <button
      type="button"
      className="pc-boton-principal"
      onClick={() => setPaso(5)}
    >
      Avanzar a Contratación →
    </button>
)}



{paso < 5 &&
  paso === etapasSeleccion.indexOf(candidato.estado) &&
  etapasSeleccion.includes(candidato.estado) &&
  candidato.estado !== "Contratado" &&
  candidato.estado !== "Oferta" &&
  candidato.estado !== "Descartado" && (


    <button
      type="button"
      className="pc-boton-principal"
      onClick={avanzarEtapa}
    >
     
Avanzar a {etapasSeleccion[etapasSeleccion.indexOf(candidato.estado) + 1]} →

    </button>
  )}

             
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}
