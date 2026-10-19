import * as empleadoService from "./empleado.service.js";

const CAMPOS_OBLIGATORIOS = [
  "nombres",
  "apellidos",
  "identidad",
  "telefono",
  "correo",
  "fechaIngreso",
  "puestoId",
  "areaId",
  "salarioBase",
];

function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validarCamposObligatorios(datos) {
  const faltantes = CAMPOS_OBLIGATORIOS.filter(
    (campo) => datos[campo] === undefined || datos[campo] === null || datos[campo] === ""
  );
  if (faltantes.length > 0) {
    return `Faltan campos obligatorios: ${faltantes.join(", ")}`;
  }
  return null;
}

function validarFechaIngreso(valor) {
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return null;
  if (fecha > new Date()) return null;
  return fecha;
}

function errorServidor(res, error) {
  console.error(error);
  return res.status(500).json({ mensaje: "Error interno del servidor" });
}

export async function obtenerEmpleados(req, res) {
  try {
    const empleados = await empleadoService.obtenerEmpleados();
    res.json(empleados);
  } catch (error) {
    errorServidor(res, error);
  }
}


export async function obtenerAreas(req, res) {
  try {
    res.json(await empleadoService.obtenerAreas());
  } catch (error) {
    errorServidor(res, error);
  }
}

export async function obtenerPuestos(req, res) {
  try {
    res.json(await empleadoService.obtenerPuestos());
  } catch (error) {
    errorServidor(res, error);
  }
}


export async function obtenerEmpleado(req, res) {
  try {
    const id = idValido(req.params.id);
    if (!id) {
      return res.status(400).json({ mensaje: "El id debe ser un número entero positivo" });
    }

    const empleado = await empleadoService.obtenerEmpleadoPorId(id);
    if (!empleado) {
      return res.status(404).json({ mensaje: "Empleado no encontrado" });
    }

    res.json(empleado);
  } catch (error) {
    errorServidor(res, error);
  }
}

export async function crearEmpleado(req, res) {
  try {
    const errorCampos = validarCamposObligatorios(req.body);
    if (errorCampos) {
      return res.status(400).json({ mensaje: errorCampos });
    }

    const puestoId = idValido(req.body.puestoId);
    const areaId = idValido(req.body.areaId);
    if (!puestoId || !areaId) {
      return res.status(400).json({ mensaje: "puestoId y areaId deben ser números enteros positivos" });
    }

    const salarioBase = Number(req.body.salarioBase);
    if (!Number.isFinite(salarioBase) || salarioBase <= 0) {
      return res.status(400).json({ mensaje: "salarioBase debe ser un número mayor que cero" });
    }

    if (!(await empleadoService.existePuesto(puestoId))) {
      return res.status(400).json({ mensaje: "El puesto no existe" });
    }

    const fechaIngreso = validarFechaIngreso(req.body.fechaIngreso);
    if (!fechaIngreso) {
      return res.status(400).json({ mensaje: "fechaIngreso no es válida o es futura" });
    }

    const empleado = await empleadoService.crearEmpleado({
      nombres: req.body.nombres,
      apellidos: req.body.apellidos,
      identidad: req.body.identidad,
      telefono: req.body.telefono,
      correo: req.body.correo,
      fechaIngreso,
      puestoId,
      areaId,
      salarioBase,
    });

    res.status(201).json(empleado);
  } catch (error) {
    if (error.code === "P2002") {
      const campo = error.meta?.target?.[0];
      const mensaje =
        campo === "correo"
          ? "El correo ya está registrado"
          : "La identidad ya está registrada";
      return res.status(409).json({ mensaje });
    }
    errorServidor(res, error);
  }
}

export async function actualizarEmpleado(req, res) {
  try {
    const id = idValido(req.params.id);
    if (!id) {
      return res.status(400).json({ mensaje: "El id debe ser un número entero positivo" });
    }

    const existente = await empleadoService.obtenerEmpleadoPorId(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Empleado no encontrado" });
    }

    // El estado solo se cambia con el endpoint de desactivar
    const { estado, id: _ignorado, ...cambios } = req.body;

    if (cambios.puestoId !== undefined) {
      const puestoId = idValido(cambios.puestoId);
      if (!puestoId || !(await empleadoService.existePuesto(puestoId))) {
        return res.status(400).json({ mensaje: "El puesto no existe" });
      }
      cambios.puestoId = puestoId;
    }

    if (cambios.fechaIngreso !== undefined) {
      const fechaIngreso = validarFechaIngreso(cambios.fechaIngreso);
      if (!fechaIngreso) {
        return res.status(400).json({ mensaje: "fechaIngreso no es válida o es futura" });
      }
      cambios.fechaIngreso = fechaIngreso;
    }

    const empleado = await empleadoService.actualizarEmpleado(id, cambios);
    res.json(empleado);
  } catch (error) {
    if (error.code === "P2002") {
      const campo = error.meta?.target?.[0];
      const mensaje =
        campo === "correo"
          ? "El correo ya está registrado"
          : "La identidad ya está registrada";
      return res.status(409).json({ mensaje });
    }
    errorServidor(res, error);
  }
}

export async function desactivarEmpleado(req, res) {
  try {
    const id = idValido(req.params.id);
    if (!id) {
      return res.status(400).json({ mensaje: "El id debe ser un número entero positivo" });
    }

    const existente = await empleadoService.obtenerEmpleadoPorId(id);
    if (!existente) {
      return res.status(404).json({ mensaje: "Empleado no encontrado" });
    }

    const motivoBaja = String(req.body?.motivoBaja ?? "").trim();
const empleado = await empleadoService.desactivarEmpleado(
  id,
  motivoBaja || null
);
    res.json(empleado);
  } catch (error) {
    errorServidor(res, error);
  }
}