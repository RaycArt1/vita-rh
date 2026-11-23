import api from "./api";

export const registrarPostulante = async (datos) => (await api.post("/postulantes/registro", datos)).data;
export const listarVacantesPostulante = async () => (await api.get("/postulantes/vacantes")).data;
export const obtenerMiPerfil = async () => (await api.get("/postulantes/me")).data;
export const obtenerMiPostulacion = async () => (await api.get("/postulantes/mi-postulacion")).data;
export const responderMiOferta = async (respuesta) =>
  (await api.patch("/postulantes/mi-postulacion/oferta", { respuesta })).data;

export async function guardarMiPerfil(datos) {
  const body = new FormData();
  for (const campo of ["telefono", "direccion", "referencias", "observaciones"]) {
    body.append(campo, datos[campo] || "");
  }
  if (datos.foto) body.append("foto", datos.foto);
  return (await api.put("/postulantes/me", body)).data;
}

export async function enviarMiPostulacion(datos) {
  const body = new FormData();
  for (const campo of ["vacanteId", "telefono", "identidad", "direccion", "referencias"]) {
    body.append(campo, datos[campo] || "");
  }
  if (datos.cv) body.append("cv", datos.cv);
  return (await api.post("/postulantes/aplicar", body)).data;
}

export async function obtenerFotoPrivada() {
  const respuesta = await api.get("/postulantes/me/foto", { responseType: "blob" });
  return URL.createObjectURL(respuesta.data);
}
