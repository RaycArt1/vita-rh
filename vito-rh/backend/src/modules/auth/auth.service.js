import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { enviarCorreoRecuperacion } from "../../services/correo.service.js";

export async function login(username, password) {
  // Limpiamos espacios en blanco accidentales
  const cleanUsername = String(username ?? "").trim();
  const cleanPassword = String(password ?? "").trim();

  console.log("-> Datos recibidos en el servicio login - username:", cleanUsername);

  const usuario = await prisma.usuario.findUnique({
    where: { username: cleanUsername },
    include: { 
      role: true,
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

  console.log("-> Resultado de la búsqueda en Prisma:", usuario ? "Usuario encontrado" : "No encontrado");

  if (!usuario) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const coincide = await bcrypt.compare(cleanPassword, usuario.password);
  console.log("-> ¿La contraseña coincide con bcrypt?:", coincide);

  if (!coincide) {
    throw new Error("Usuario o contraseña incorrectos");
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.role?.nombre || "ADMINISTRADOR", // Usamos el nombre del rol relacionado
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
      rol: usuario.role?.nombre || "ADMINISTRADOR", // Retornamos el rol correcto
      empleado: usuario.empleado,
    },
  };
}

export async function solicitarRecuperacion(correo) {
  const empleado = await prisma.empleado.findUnique({
    where: { correo },
    include: { usuario: true },
  });

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