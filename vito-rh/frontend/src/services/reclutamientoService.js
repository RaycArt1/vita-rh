
import api from "./api";

export const obtenerCandidatos = async () => {
  const respuesta = await api.get("/reclutamiento");
  return respuesta.data;
};

export const crearCandidato = async (datos) => {
  const formulario = new FormData();

  formulario.append("nombre", datos.nombre);
  formulario.append("apellido", datos.apellido);
  formulario.append("telefono", datos.telefono || "");
  formulario.append("email", datos.email || "");
  formulario.append("puestoAplicado", datos.puestoAplicado);

  if (datos.cv) {
    formulario.append("cv", datos.cv);
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