
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Interceptor para agregar el token automáticamente en cada petición
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("gestRH_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export const fetchReportes = async () => {
  try {
    const response = await api.get("/reportes");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los reportes:", error);
    return [];
  }
};

export const guardarReporte = async (reporteData) => {
  try {
    const response = await api.post("/reportes", reporteData);
    return response.data;
  } catch (error) {
    console.error("Error al guardar el reporte:", error);
    throw error;
  }
};

export default api;