
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Interceptor para agregar el token automáticamente en cada petición (soporta múltiples claves y storages)
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("gestRH_token") ||
      localStorage.getItem("gestRH_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// FUNCIONES PARA REPORTES
// ==========================================

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

// ==========================================
// FUNCIONES PARA ROLES
// ==========================================

export const fetchRoles = async () => {
  try {
    const response = await api.get("/roles");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los roles:", error);
    return [];
  }
};

export const crearRol = async (rolData) => {
  try {
    const response = await api.post("/roles", rolData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el rol:", error);
    throw error;
  }
};

export const actualizarRol = async (rolId, rolData) => {
  try {
    const response = await api.put(`/roles/${rolId}`, rolData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el rol:", error);
    throw error;
  }
};

// ==========================================
// FUNCIONES PARA PERMISOS DEL ROL
// ==========================================

export const fetchPermisosRol = async (roleId) => {
  try {
    const response = await api.get(`/roles/${roleId}/permisos`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener los permisos del rol ${roleId}:`, error);
    return { permisos: [] };
  }
};

export const guardarPermisosRol = async (roleId, permisosData) => {
  try {
    const response = await api.put(`/roles/${roleId}/permisos`, permisosData);
    return response.data;
  } catch (error) {
    console.error(`Error al guardar los permisos del rol ${roleId}:`, error);
    throw error;
  }
};

export default api;