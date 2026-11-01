import api from './api';

// 1. Petición para REGISTRAR empleado (POST /api/empleados)
export const registrarEmpleadoAPI = async (datosEmpleado) => {
  try {
    const respuesta = await api.post('/empleados', datosEmpleado);
    return respuesta.data;
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al registrar el empleado';
  }
};

// 2. Petición para EDITAR empleado (PUT /api/empleados/:id)
export const actualizarEmpleadoAPI = async (id, datosEmpleado) => {
  try {
    const respuesta = await api.put(`/empleados/${id}`, datosEmpleado);
    return respuesta.data;
  } catch (error) {
    throw error.response?.data?.mensaje || 'Error al actualizar el empleado';
  }
};