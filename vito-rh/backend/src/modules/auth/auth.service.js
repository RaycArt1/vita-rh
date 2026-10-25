import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { enviarCorreoRecuperacion } from "../../services/correo.service.js";

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

  export async function solicitarRecuperacion(correo) {
  const empleado = await prisma.empleado.findUnique({
    where: { correo },
    include: { usuario: true },
  });

  // Si no hay usuario asociado, no se envía nada, pero la respuesta es la misma
  if (!empleado?.usuario) return;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const tokenExpira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  await prisma.usuario.update({
    where: { id: empleado.usuario.id },
    data: { tokenRecuperacion: tokenHash, tokenExpira },
  });

  const enlace = `${process.env.FRONTEND_URL}/restablecer/${token}`;
  await enviarCorreoRecuperacion(empleado.correo, enlace);
}


export async function restablecerContrasena(token, nuevaPassword) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const usuario = await prisma.usuario.findFirst({
    where: {
      tokenRecuperacion: tokenHash,
      tokenExpira: { gt: new Date() },
    },
  });

  if (!usuario) {
    throw new Error("El enlace no es válido o ya expiró.");
  }

  const hash = await bcrypt.hash(nuevaPassword, 10);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      password: hash,
      tokenRecuperacion: null,
      tokenExpira: null,
    },
  });
}