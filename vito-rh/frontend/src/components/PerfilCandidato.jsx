
import { useState } from "react";
import "./PerfilCandidato.css";

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
});

const [editandoEvaluacion, setEditandoEvaluacion] = useState(false);
const guardarEntrevista = () => {
  if (!entrevista.fecha || !entrevista.observaciones.trim()) {
    alert("Completa la fecha y las observaciones de la entrevista.");
    return;
  }

  const entrevistaActualizada = {
    ...entrevista,
    observaciones: entrevista.observaciones.trim(),
  };

  onActualizar({
    ...candidato,
    entrevista: entrevistaActualizada,
  });

  setEditandoEntrevista(false);
};

const guardarEvaluacion = () => {
  const puntuacion = Number(evaluacion.puntuacion);

  if (
    !Number.isInteger(puntuacion) ||
    puntuacion < 1 ||
    puntuacion > 10
  ) {
    alert("La puntuación debe ser un número entero entre 1 y 10.");
    return;
  }

  const evaluacionActualizada = {
    ...evaluacion,
    puntuacion,
    observaciones: evaluacion.observaciones.trim(),
  };

  onActualizar({
    ...candidato,
    puntuacion,
    evaluacion: evaluacionActualizada,
  });

  setEditandoEvaluacion(false);
};


const guardarOferta = () => {
  if (!oferta.salario || !oferta.fechaInicio) {
    alert("Completa el salario y la fecha de inicio.");
    return;
  }

  const ofertaActualizada = {
    ...oferta,
    estado: "Pendiente",
  };

  setOferta(ofertaActualizada);

  onActualizar({
    ...candidato,
    oferta: ofertaActualizada,
  });

  setEditandoOferta(false);
};

const responderOferta = (respuesta) => {
  if (!candidato.oferta || candidato.estado !== "Oferta") {
    return;
  }

  const ofertaActualizada = {
    ...candidato.oferta,
    estado: respuesta,
  };

  setOferta(ofertaActualizada);

  onActualizar({
    ...candidato,
    oferta: ofertaActualizada,
  });
};
  const registrarContratacion = () => {
  if (
    candidato.estado !== "Oferta" ||
    candidato.oferta?.estado !== "Aceptada"
  ) {
    return;
  }

  const confirmar = window.confirm(
    `¿Deseas confirmar la contratación de ${candidato.nombre}?`
  );

  if (!confirmar) {
    return;
  }

  onActualizar({
    ...candidato,
    estado: "Contratado",
  });
};


const etapasSeleccion = [
  "Aplicación",
  "Revisión CV",
  "Entrevista",
  "Evaluación",
  "Oferta",
  "Contratado",
];

const avanzarEtapa = () => {
  const indiceActual = etapasSeleccion.indexOf(candidato.estado);

  if (indiceActual >= 0 && indiceActual < etapasSeleccion.length - 1) {
    onActualizar({
      ...candidato,
      estado: etapasSeleccion[indiceActual + 1],
    });
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
            <div className="pc-avatar">{iniciales}</div>

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
              onClick={() => setPaso(Math.max(0, paso - 1))}
            >
              ← Retroceder
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
                  <small>Experiencia / Observaciones</small>
                  <strong>{candidato.notas || "Sin observaciones"}</strong>
                </div>

                <div className="pc-ancho-completo">
                  <small>Currículum</small>
                  {candidato.cv ? (
                    <a
                      href={URL.createObjectURL(candidato.cv)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver CV: {candidato.cv.name}
                    </a>
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

                <div className="pc-ancho-completo">
                  <small>Dirección</small>
                  <strong>{candidato.direccion || "No registrada"}</strong>
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
          OBSERVACIONES
          <textarea
            rows="4"
            value={entrevista.observaciones}
            onChange={(e) =>
              setEntrevista({
                ...entrevista,
                observaciones: e.target.value,
              })
            }
            placeholder="Escribe las observaciones de la entrevista..."
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
        <label>
          RESULTADO
          <select
            value={entrevista.resultado}
            onChange={(e) =>
              setEntrevista({
                ...entrevista,
                resultado: e.target.value,
              })
            }
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </label>

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
        <p><strong>Tipo:</strong> {candidato.entrevista.tipo}</p>
        <p><strong>Observaciones:</strong> {candidato.entrevista.observaciones}</p>
        <p><strong>Resultado:</strong> {candidato.entrevista.resultado}</p>





{candidato.entrevista.documento && (
  <div className="pc-documento-entrevista">
    <p><strong>Documento de entrevista</strong></p>

    <p>{candidato.entrevista.documento.name}</p>

    <button
      type="button"
      onClick={() => {
        const url = URL.createObjectURL(
          candidato.entrevista.documento
        );

        window.open(url, "_blank", "noopener,noreferrer");
      }}
    >
      Ver documento
    </button>
  </div>
)}


        <button
          type="button"
          className="pc-boton-principal"
          onClick={() => setEditandoEntrevista(true)}
        >
          Modificar entrevista
        </button>
      </div>
    ) : (
      <div>
        <p>Este candidato todavía no tiene una entrevista registrada.</p>

        <button
          type="button"

          className="pc-boton-principal"
          onClick={() => setEditandoEntrevista(true)}
        >
          + Registrar entrevista
        </button>
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
          CLASIFICACIÓN ADICIONAL
          <select
            value={evaluacion.clasificacion}
            onChange={(e) =>
              setEvaluacion({
                ...evaluacion,
                clasificacion: e.target.value,
              })
            }
          >
            <option value="Informativo">Informativo</option>
            <option value="Bueno">Bueno</option>
            <option value="Excelente">Excelente</option>
            <option value="Requiere seguimiento">
              Requiere seguimiento
            </option>
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
            <strong>Clasificación:</strong>{" "}
            {candidato.evaluacion?.clasificacion ?? "Informativo"}
          </p>

          <p>
            <strong>Observaciones:</strong>{" "}
            {candidato.evaluacion?.observaciones || "Sin observaciones"}
          </p>
        </div>

        <button
          type="button"
          className="pc-boton-principal"
          onClick={() => setEditandoEvaluacion(true)}
        >
          Modificar evaluación
        </button>
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
                <h3>Continuar con la contratación</h3>
                <p>
                  Una vez aceptada la oferta, podremos registrar
                  al candidato como empleado.
                </p>
                <button
  type="button"
  disabled={
    candidato.estado !== "Oferta" ||
    candidato.oferta?.estado !== "Aceptada"
  }
  onClick={registrarContratacion}
>
                  Registrar como empleado
                </button>
              </div>
            )}
          </div>

          <div className="pc-acciones">
            <button
              type="button"
              className="pc-boton-secundario"
              disabled={paso === 0}
              onClick={() => setPaso(paso - 1)}
              
            >
              ← Anterior
            </button>

            <div className="pc-acciones-derecha">
              <button
                type="button"
                className="pc-boton-secundario"
                onClick={onCerrar}
              >
                Cancelar
              </button>
{etapasSeleccion.includes(candidato.estado) &&
  candidato.estado !== "Contratado" &&
  candidato.estado !== "Oferta" && (
    <button
      type="button"
      className="pc-boton-principal"
      onClick={avanzarEtapa}
    >
      Avanzar etapa
    </button>
  )}

              {paso < 5 && (
                <button
                  type="button"
                  className="pc-boton-principal"
                  onClick={() => setPaso(paso + 1)}
                >
                  Siguiente →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
