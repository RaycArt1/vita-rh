import * as empleadoService from "./empleado.service.js";

export async function obtenerEmpleados(req, res) {
  try {
    const empleados = await empleadoService.obtenerEmpleados();

    res.json(empleados);

  } catch (error) {

    res.status(500).json({
      mensaje: error.message,
    });

  }
}