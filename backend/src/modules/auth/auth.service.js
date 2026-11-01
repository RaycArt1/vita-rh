import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(username, password) {
  const usuario = await prisma.usuario.findUnique({
    where: { username },
    include: {
      empleado: {
        include: {
          puesto: {
            include: {
              area: true,
            },
          },
        },
      },
    },
  });

  if (!usuario) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const coincide = await bcrypt.compare(password, usuario.password);

  if (!coincide) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      empleado: usuario.empleado,
    },
  };
}