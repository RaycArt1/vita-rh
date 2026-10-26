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

const incluirRol = {
  role: {
    select: {
      id: true,
      nombre: true,
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
      activo: true,
      ultimoAcceso: true,
      empleadoId: true,
      roleId: true,
      role: incluirRol.role,
      empleado: incluirEmpleado.empleado,
    },
    orderBy: { id: "asc" },
  });

  // Mapeamos para que la propiedad 'rol' devuelva el nombre del rol para el frontend
  return usuarios.map((u) => ({
    ...u,
    rol: u.role?.nombre || "SIN ROL",
  }));
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

export async function crearUsuario({ username, password, roleId, rol, empleadoId }) {
  const hash = await bcrypt.hash(password, 10);

  let idRolAsignar = roleId ? Number(roleId) : null;

  if (!idRolAsignar && rol) {
    // Búsqueda flexible del rol por nombre
    const rolEncontrado = await prisma.role.findFirst({
      where: {
        OR: [
          { nombre: String(rol).toUpperCase() },
          { nombre: String(rol).toLowerCase() },
          { nombre: rol },
        ],
      },
    });

    if (rolEncontrado) {
      idRolAsignar = rolEncontrado.id;
    }
  }

  // Si no se encuentra por texto, asignamos el primer rol disponible en la BD por seguridad
  if (!idRolAsignar) {
    const primerRol = await prisma.role.findFirst();
    if (primerRol) {
      idRolAsignar = primerRol.id;
    } else {
      throw new Error("El rol especificado no es válido o no existe en la base de datos.");
    }
  }

  const usuario = await prisma.usuario.create({
    data: {
      username,
      password: hash,
      roleId: idRolAsignar,
      empleadoId: Number(empleadoId),
      activo: true,
    },
    select: {
      id: true,
      username: true,
      activo: true,
      ultimoAcceso: true,
      empleadoId: true,
      roleId: true,
      role: incluirRol.role,
      empleado: incluirEmpleado.empleado,
    },
  });

  return {
    ...usuario,
    rol: usuario.role?.nombre || "SIN ROL",
  };
}

export async function actualizarUsuario(id, cambios) {
  const data = {};

  if (cambios.username !== undefined) data.username = cambios.username;
  if (cambios.activo !== undefined) data.activo = cambios.activo;
  if (cambios.roleId !== undefined) data.roleId = Number(cambios.roleId);
  
  // Si mandan el rol como texto ('ADMINISTRADOR', etc.), lo convertimos a su ID correspondiente
  if (cambios.rol !== undefined && !cambios.roleId) {
    data.roleId = await buscarRoleIdPorNombre(cambios.rol);
  }

  if (cambios.password) {
    data.password = await bcrypt.hash(cambios.password, 10);
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      activo: true,
      ultimoAcceso: true,
      empleadoId: true,
      roleId: true,
      role: incluirRol.role,
      empleado: incluirEmpleado.empleado,
    },
  });

  return {
    ...usuario,
    rol: usuario.role?.nombre || "SIN ROL",
  };
}

// Función auxiliar para buscar el ID de un rol por su nombre en caso de que llegue texto
async function buscarRoleIdPorNombre(nombreRol) {
  if (!nombreRol) return null;
  const rolEncontrado = await prisma.role.findFirst({
    where: { nombre: String(nombreRol).toUpperCase() },
  });
  return rolEncontrado ? rolEncontrado.id : null;
}