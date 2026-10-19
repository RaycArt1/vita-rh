
import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";

const incluirEmpleado = {
  empleado: {
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      correo: true,
      estado: true,
      puesto: { select: { nombre: true } },
      area: { select: { nombre: true } },
    },
  },
};

function usuarioSeguro(usuario) {
  if (!usuario) return usuario;
  const { password, ...datos } = usuario;
  return datos;
}

export async function listarUsuarios() {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      username: true,
      rol: true,
      activo: true,
      ultimoAcceso: true,
      empleadoId: true,
      empleado: incluirEmpleado.empleado,
    },
    orderBy: { id: "asc" },
  });

  return usuarios;
}

export async function listarEmpleadosDisponibles() {
  return prisma.empleado.findMany({
    where: {
      usuario: null,
      estado: "ACTIVO",
    },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      correo: true,
      puesto: { select: { nombre: true } },
    },
    orderBy: { nombres: "asc" },
  });
}

export async function crearUsuario({ username, password, rol, empleadoId }) {
  const hash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      username,
      password: hash,
      rol,
      empleadoId,
    },
    select: {
      id: true,
      username: true,
      rol: true,
      activo: true,
      ultimoAcceso: true,
      empleadoId: true,
      empleado: incluirEmpleado.empleado,
    },
  });

  return usuario;
}

export async function actualizarUsuario(id, cambios) {
  const data = {};

  if (cambios.username !== undefined) data.username = cambios.username;
  if (cambios.rol !== undefined) data.rol = cambios.rol;
  if (cambios.activo !== undefined) data.activo = cambios.activo;

  if (cambios.password) {
    data.password = await bcrypt.hash(cambios.password, 10);
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      rol: true,
      activo: true,
      ultimoAcceso: true,
      empleadoId: true,
      empleado: incluirEmpleado.empleado,
    },
  });

  return usuario;
}
