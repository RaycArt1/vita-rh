
import api from "./api";

export const obtenerCandidatos = async () => {
  const respuesta = await api.get("/reclutamiento");
  return respuesta.data;
};

export const crearCandidato = async (datos) => {
  const formulario = new FormData();

  formulario.append("nombre", datos.nombre);
  formulario.append("apellido", datos.apellido);

formulario.append("identidad", datos.identidad || "");

  formulario.append("telefono", datos.telefono || "");

formulario.append("direccion", datos.direccion || "");
formulario.append("referencias", datos.referencias || "");

  formulario.append("email", datos.email || "");
  formulario.append("puestoAplicado", datos.puestoAplicado);

if (datos.vacanteId) {
  formulario.append("vacanteId", datos.vacanteId);
}


  if (datos.cv) {
    formulario.append("cv", datos.cv);
  }


  if (datos.foto) {
   formulario.append("foto", datos.foto);
  }



  const respuesta = await api.post("/reclutamiento", formulario);

  return respuesta.data;
};

export const actualizarEstadoCandidato = async (id, cambios) => {
  const respuesta = await api.put(
    `/reclutamiento/${id}`,
    cambios
  );

  return respuesta.data;
};
export const crearEntrevista = async (candidatoId, datos) => {
  const { data } = await api.post(
    `/reclutamiento/${candidatoId}/entrevistas`,
    datos
  );

  return data;
};


export const actualizarEntrevista = async (
  candidatoId,
  entrevistaId,
  datos
) => {
  const { data } = await api.put(
    `/reclutamiento/${candidatoId}/entrevistas/${entrevistaId}`,
    datos
  );

  return data;
};

export const cambiarEstadoEntrevista = async (
  candidatoId,
  entrevistaId,
  estadoEntrevista
) => {
  const { data } = await api.patch(
    `/reclutamiento/${candidatoId}/entrevistas/${entrevistaId}/estado`,
    { estadoEntrevista }
  );

  return data;
};


export const subirDocumentoEntrevista = async (
  candidatoId,
  entrevistaId,
  archivo
) => {
  const formulario = new FormData();

  formulario.append("documento", archivo);

  const { data } = await api.post(
    `/reclutamiento/${candidatoId}/entrevistas/${entrevistaId}/documento`,
    formulario
  );

  return data;
};



export const obtenerDocumentoEntrevista = async (
  candidatoId,
  entrevistaId
) => {
  const { data } = await api.get(
    `/reclutamiento/${candidatoId}/entrevistas/${entrevistaId}/documento`,
    {
      responseType: "blob",
    }
  );

  return data;
};




export const guardarEvaluacion = async (candidatoId, datos) => {
  const { data } = await api.put(
    `/reclutamiento/${candidatoId}/evaluacion`,
    datos
  );

  return data;
};


export const guardarOferta = async (candidatoId, datos) => {
  const { data } = await api.put(
    `/reclutamiento/${candidatoId}/oferta`,
    datos
  );

  return data.oferta;
};



export const responderOferta = async (candidatoId, respuesta) => {
  const { data } = await api.patch(
    `/reclutamiento/${candidatoId}/oferta/respuesta`,
    { respuesta }
  );

  return data.oferta;
};




export const descartarCandidato = async (candidatoId, motivo) => {
  const { data } = await api.patch(
    `/reclutamiento/${candidatoId}/descartar`,
    { motivo }
  );

  return data.candidato;
};



export const obtenerCatalogosContratacion = async () => {
  const { data } = await api.get(
    "/reclutamiento/catalogos-contratacion"
  );

  return data.areas;
};

export const contratarCandidato = async (candidatoId, datos) => {
  const { data } = await api.post(
    `/reclutamiento/${candidatoId}/contratar`,
    datos
  );

  return data.empleado;
};


export const obtenerVacantes = async () => {
  const { data } = await api.get("/reclutamiento/vacantes");
  return data;
};

export const crearVacante = async (datos) => {
  const { data } = await api.post("/reclutamiento/vacantes", datos);
  return data;
};

export const obtenerAreas = async () => {
  const { data } = await api.get("/empleados/catalogos/areas");
  return data;
};



export const obtenerCV = async (candidatoId) => {
  const { data } = await api.get(
    `/reclutamiento/${candidatoId}/cv`,
    { responseType: "blob" }
  );

  return data;
};


export const obtenerFoto = async (candidatoId) => {
  const { data } = await api.get(
    `/reclutamiento/${candidatoId}/foto`,
    {
      responseType: "blob",
    }
  );

  return data;
};






