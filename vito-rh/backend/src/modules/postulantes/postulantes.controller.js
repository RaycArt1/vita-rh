import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "node:path";
import fs from "node:fs/promises";

const enviarError = (res, status, mensaje) => res.status(status).json({ mensaje });
const texto = (valor, max = 500) => String(valor ?? "").trim().slice(0, max);

async function cuenta(req) {
  // Nunca se recibe el ID del postulante desde el navegador.
  return prisma.postulante.findUnique({ where: { id: Number(req.usuario.postulanteId) } });
}

export async function registrar(req, res) {
  try {
    const nombre = texto(req.body.nombre, 90);
    const apellido = texto(req.body.apellido, 90);
    const email = texto(req.body.email, 190).toLowerCase();
    const telefono = texto(req.body.telefono, 24) || null;
    const password = String(req.body.password ?? "");
    if (!nombre || !apellido || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 72) {
      return enviarError(res, 400, "Completa nombre, apellido, correo válido y contraseña de 8 a 72 caracteres.");
    }
    if (!process.env.JWT_SECRET) return enviarError(res, 500, "No está configurada la autenticación del servidor.");
    const existente = await prisma.postulante.findUnique({ where: { email } });
    if (existente) return enviarError(res, 409, "Ya existe una cuenta con este correo.");
    const creado = await prisma.postulante.create({
      data: { nombre, apellido, email, telefono, password: await bcrypt.hash(password, 12) },
    });
    return res.status(201).json({ mensaje: "Cuenta creada. Ya puedes iniciar sesión." });
  } catch (error) {
    if (error.code === "P2002") return enviarError(res, 409, "El correo ya está registrado.");
    console.error("Registro postulante:", error);
    return enviarError(res, 500, "No fue posible crear la cuenta.");
  }
}

async function vacantesActivas() {
  const items = await prisma.vacante.findMany({
    where: { activa: true },
    select: {
      id: true, nombre: true, descripcion: true, plazasTotales: true,
      area: { select: { id: true, nombre: true } },
      _count: { select: { candidatos: { where: { estado: "CONTRATADO", empleado: { isNot: null } } } } },
    },
    orderBy: { fechaCreacion: "desc" },
  });
  return items.map(({ _count, ...v }) => ({
    ...v,
    plazasCubiertas: _count.candidatos,
    plazasDisponibles: Math.max(0, v.plazasTotales - _count.candidatos),
  })).filter((v) => v.plazasDisponibles > 0);
}

export async function listarVacantesPublicas(_req, res) {
  try { return res.json(await vacantesActivas()); }
  catch (error) { console.error("Vacantes públicas:", error); return enviarError(res, 500, "No se pudieron consultar las vacantes."); }
}

export async function obtenerMiPerfil(req, res) {
  try {
    const p = await cuenta(req);
    if (!p) return enviarError(res, 404, "Cuenta no encontrada.");
    const { id, nombre, apellido, email, telefono, direccion, referencias, observaciones, fotoArchivo, candidatoId } = p;
    return res.json({ id, nombre, apellido, email, telefono, direccion, referencias, observaciones, tieneFoto: Boolean(fotoArchivo), tienePostulacion: Boolean(candidatoId) });
  } catch (error) { console.error("Mi perfil:", error); return enviarError(res, 500, "No se pudo cargar tu perfil."); }
}

export async function actualizarMiPerfil(req, res) {
  try {
    const p = await cuenta(req);
    if (!p) return enviarError(res, 404, "Cuenta no encontrada.");
    const datos = {
      telefono: texto(req.body.telefono, 24) || null,
      direccion: texto(req.body.direccion, 400) || null,
      referencias: texto(req.body.referencias, 1000) || null,
      observaciones: texto(req.body.observaciones, 1000) || null,
      ...(req.file ? { fotoArchivo: req.file.filename } : {}),
    };
    await prisma.$transaction(async (tx) => {
      await tx.postulante.update({ where: { id: p.id }, data: datos });
      if (p.candidatoId) {
        await tx.candidato.update({
          where: { id: p.candidatoId },
          data: {
            telefono: datos.telefono, direccion: datos.direccion,
            referencias: datos.referencias,
            ...(req.file ? { fotoArchivo: req.file.filename } : {}),
          },
        });
      }
    });
    if (req.file && p.fotoArchivo && p.fotoArchivo !== req.file.filename) {
      fs.unlink(path.resolve(process.cwd(), "uploads", "fotos-postulantes", path.basename(p.fotoArchivo))).catch(() => {});
    }
    return res.json({ mensaje: "Información guardada correctamente." });
  } catch (error) { console.error("Actualizar perfil:", error); return enviarError(res, 500, "No se pudieron guardar los cambios."); }
}

export async function obtenerMiFoto(req, res) {
  try {
    const p = await cuenta(req);
    if (!p?.fotoArchivo) return enviarError(res, 404, "No tienes fotografía registrada.");
    res.setHeader("Cache-Control", "private, no-store");
    return res.sendFile(path.resolve(process.cwd(), "uploads", "fotos-postulantes", path.basename(p.fotoArchivo)), (err) => {
      if (err && !res.headersSent) return enviarError(res, 404, "La fotografía no está disponible.");
    });
  } catch (error) { return enviarError(res, 500, "No se pudo mostrar la fotografía."); }
}

export async function aplicar(req, res) {
  try {
    const p = await cuenta(req);
    if (!p) return enviarError(res, 404, "Cuenta no encontrada.");
    if (p.candidatoId) return enviarError(res, 409, "Ya tienes una postulación activa en tu cuenta.");
    const vacanteId = Number(req.body.vacanteId);
    if (!Number.isInteger(vacanteId) || vacanteId < 1) return enviarError(res, 400, "Selecciona una vacante válida.");
    const identidad = texto(req.body.identidad, 20) || null;
    if (identidad && !/^\d{13}$/.test(identidad)) return enviarError(res, 400, "La identidad debe tener 13 dígitos.");
    const telefono = texto(req.body.telefono, 24) || p.telefono;
    const direccion = texto(req.body.direccion, 400) || p.direccion;
    const referencias = texto(req.body.referencias, 1000) || p.referencias;
    if (!telefono) return enviarError(res, 400, "Completa tu teléfono de contacto.");
    if (!req.file) return enviarError(res, 400, "Adjunta tu currículum en PDF, máximo 5 MB.");
    if (path.extname(req.file.originalname).toLowerCase() !== ".pdf") return enviarError(res, 400, "Para aplicar debes subir tu CV en formato PDF.");

    const resultado = await prisma.$transaction(async (tx) => {
      const vacante = await tx.vacante.findUnique({
        where: { id: vacanteId },
        include: { _count: { select: { candidatos: { where: { estado: "CONTRATADO", empleado: { isNot: null } } } } } },
      });
      if (!vacante?.activa) throw Object.assign(new Error("La vacante no está disponible."), { status: 404 });
      if (vacante._count.candidatos >= vacante.plazasTotales) throw Object.assign(new Error("Esta vacante ya tiene todas sus plazas cubiertas."), { status: 409 });
      const actualizado = await tx.postulante.updateMany({ where: { id: p.id, candidatoId: null }, data: { telefono, direccion, referencias } });
      if (actualizado.count !== 1) throw Object.assign(new Error("Ya existe una postulación para esta cuenta."), { status: 409 });
      const candidato = await tx.candidato.create({
        data: {
          nombre: p.nombre,
          apellido: p.apellido,
          email: p.email,
          telefono,
          identidad,
          direccion,
          referencias,
          fotoArchivo: p.fotoArchivo,
          puestoAplicado: vacante.nombre,
          vacanteId,
          cvArchivo: req.file.filename,
          estado: "EN_PROCESO",
          etapa: "APLICACION",
        },
      });
      await tx.postulante.update({ where: { id: p.id }, data: { candidatoId: candidato.id } });
      return candidato;
    });
    return res.status(201).json({ mensaje: "Tu postulación fue enviada correctamente.", candidatoId: resultado.id });
  } catch (error) {
    console.error("Enviar postulación:", error);
    return enviarError(res, error.status || 500, error.status ? error.message : "No fue posible enviar la postulación.");
  }
}

export async function miPostulacion(req, res) {
  try {
    const p = await cuenta(req);
    if (!p) return enviarError(res, 404, "Cuenta no encontrada.");
    if (!p.candidatoId) return res.json(null);
    const c = await prisma.candidato.findUnique({
      where: { id: p.candidatoId },
      select: {
        id: true, puestoAplicado: true, estado: true, etapa: true, fechaRegistro: true,
        motivoDescarte: true,
        vacante: { select: { id: true, nombre: true, area: { select: { nombre: true } } } },
        entrevistas: { select: { id: true, fase: true, fecha: true, modalidad: true, indicaciones: true, estadoEntrevista: true }, orderBy: { fecha: "desc" } },
        oferta: { select: { id: true, tipoContrato: true, salario: true, fechaInicio: true, estado: true, fechaOferta: true, fechaRespuesta: true } },
      },
    });
    if (!c) return res.json(null);
    return res.json({ ...c, oferta: c.oferta ? { ...c.oferta, salario: String(c.oferta.salario) } : null });
  } catch (error) { console.error("Mi postulación:", error); return enviarError(res, 500, "No se pudo cargar el seguimiento."); }
}

export async function responderMiOferta(req, res) {
  try {
    const p = await cuenta(req);
    if (!p?.candidatoId) return enviarError(res, 404, "No tienes ninguna postulación.");
    const respuesta = texto(req.body.respuesta, 10).toUpperCase();
    if (!["ACEPTADA", "RECHAZADA"].includes(respuesta)) return enviarError(res, 400, "Selecciona aceptar o rechazar.");
    const c = await prisma.candidato.findUnique({ where: { id: p.candidatoId }, select: { estado: true, etapa: true } });
    if (!c || c.estado !== "EN_PROCESO" || c.etapa !== "OFERTA") return enviarError(res, 409, "No tienes una oferta disponible para responder.");
    const cambio = await prisma.oferta.updateMany({
      where: { candidatoId: p.candidatoId, estado: "PENDIENTE" },
      data: { estado: respuesta, fechaRespuesta: new Date() },
    });
    if (cambio.count !== 1) return enviarError(res, 409, "Esta oferta ya fue respondida o no existe.");
    return res.json({ mensaje: respuesta === "ACEPTADA" ? "Oferta aceptada correctamente." : "Oferta rechazada correctamente." });
  } catch (error) { console.error("Responder oferta:", error); return enviarError(res, 500, "No se pudo guardar tu respuesta."); }
}
