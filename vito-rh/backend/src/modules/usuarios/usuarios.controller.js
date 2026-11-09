import * as usuariosService from "./usuarios.service.js";
import { registrarBitacora } from "../bitacora/bitacora.service.js";
import prisma from "../../config/prisma.js"; // Asegúrate de importar prisma si validas dinámicamente

// Lista estricta actualizada con los roles que ya utilizas
const ROLES = ["ADMINISTRADOR", "CHEF", "EMPLEADO", "CLIENTE", "COCINERO"];

// Expresión regular para validar al menos un carácter especial
const specialCharRegex = /[.\-!@#$%^&*(),?":{}|<>/]/;

function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}


function responderError(res, error) {
  if (error.code === "P2002") {
    return res.status(409).json({
      mensaje: "El nombre de usuario o el empleado ya tiene una cuenta.",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ mensaje: "Usuario no encontrado." });
  }

  console.error(error);
  return res.status(500).json({ mensaje: "Error interno del servidor." });
}

export async function listar(req, res) {
  try {
    res.json(await usuariosService.listarUsuarios());
  } catch (error) {
    responderError(res, error);
  }
}

export async function empleadosDisponibles(req, res) {
  try {
    res.json(await usuariosService.listarEmpleadosDisponibles());
  } catch (error) {
    responderError(res, error);
  }
}

export async function crear(req, res) {
  try {
    const username = String(req.body.username ?? "").trim();
    const password = String(req.body.password ?? "");
    const confirmPassword = String(req.body.confirmPassword ?? "");
    const rol = String(req.body.rol ?? "").toUpperCase(); // Normalizamos a mayúsculas
    const empleadoId = idValido(req.body.empleadoId);

    if (!username || username.length < 3) {
      return res.status(400).json({
        mensaje: "El usuario debe tener al menos 3 caracteres.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres.",
      });
    }

    // Validación de carácter especial
    if (!specialCharRegex.test(password)) {
      return res.status(400).json({
        mensaje: "La contraseña debe contener al menos un carácter especial (ej. @, $, !, %).",
      });
    }

    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      return res.status(400).json({
        mensaje: "Las contraseñas no coinciden.",
      });
    }

    // Validación unificada: Validar contra el array local O directamente en la BD
    const rolExisteEnBD = await prisma.role.findFirst({
      where: { nombre: rol }
    });

    if (!ROLES.includes(rol) && !rolExisteEnBD) {
      return res.status(400).json({ mensaje: "Rol no válido." });
    }

    if (!empleadoId) {
      return res.status(400).json({
        mensaje: "Selecciona un empleado válido.",
      });
    }

    const empleado = await usuariosService.listarEmpleadosDisponibles();
    if (!empleado.some((item) => item.id === empleadoId)) {
      return res.status(400).json({
        mensaje: "El empleado no existe, está inactivo o ya tiene una cuenta.",
      });
    }

    const usuario = await usuariosService.crearUsuario({
      username,
      password,
      rol,
      empleadoId,
    });

    await registrarBitacora({
  usuarioId: req.usuario.id,
  accion: "INSERT",
  tablaAfectada: "Usuario",
  idRegistro: usuario.id,
  descripcion: `Usuario ${usuario.username} creado con rol ${usuario.rol}`,
  ipOrigen: req.ip,
});

res.status(201).json(usuario);
  } catch (error) {
    responderError(res, error);
  }
}

export async function actualizar(req, res) {
  try {
    const id = idValido(req.params.id);
    if (!id) {
      return res.status(400).json({ mensaje: "ID no válido." });
    }

  const anterior = await prisma.usuario.findUnique({
    where: { id },
    include: { role: true },
    });
    if (!anterior) {
    return res.status(404).json({ mensaje: "Usuario no encontrado." });
    } 

    const cambios = {};

    if (req.body.username !== undefined) {
      cambios.username = String(req.body.username).trim();
      if (cambios.username.length < 3) {
        return res.status(400).json({
          mensaje: "El usuario debe tener al menos 3 caracteres.",
        });
      }
    }

    if (req.body.rol !== undefined) {
      const rolActualizar = String(req.body.rol).toUpperCase();
      const rolExisteEnBD = await prisma.role.findFirst({
        where: { nombre: rolActualizar }
      });

      if (!ROLES.includes(rolActualizar) && !rolExisteEnBD) {
        return res.status(400).json({ mensaje: "Rol no válido." });
      }
      cambios.rol = rolActualizar;
    }

    if (req.body.password !== undefined && req.body.password !== "") {
      const password = String(req.body.password);
      if (password.length < 8) {
        return res.status(400).json({
          mensaje: "La contraseña debe tener al menos 8 caracteres.",
        });
      }

      if (!specialCharRegex.test(password)) {
        return res.status(400).json({
          mensaje: "La contraseña debe contener al menos un carácter especial (ej. @, $, !, %).",
        });
      }

      cambios.password = password;
    }

    if (req.body.activo !== undefined) {
      if (typeof req.body.activo !== "boolean") {
        return res.status(400).json({ mensaje: "Estado no válido." });
      }
      cambios.activo = req.body.activo;
    }

    const actualizado = await usuariosService.actualizarUsuario(id, cambios);

const partes = [];
if (cambios.rol !== undefined && actualizado.roleId !== anterior.roleId) {
  partes.push(`Rol de ${anterior.role?.nombre} a ${actualizado.rol}`);
}
if (cambios.username !== undefined && cambios.username !== anterior.username) {
  partes.push(`Usuario de ${anterior.username} a ${cambios.username}`);
}
if (cambios.activo !== undefined && cambios.activo !== anterior.activo) {
  partes.push(cambios.activo ? "Usuario activado" : "Usuario desactivado");
}
if (cambios.password) {
  partes.push("contraseña actualizada");
}

await registrarBitacora({
  usuarioId: req.usuario.id,
  accion: "UPDATE",
  tablaAfectada: "Usuario",
  idRegistro: id,
  descripcion: partes.join("; ") || "Sin cambios relevantes",
  ipOrigen: req.ip,
});

res.json(actualizado);
  } catch (error) {
    responderError(res, error);
  }
}