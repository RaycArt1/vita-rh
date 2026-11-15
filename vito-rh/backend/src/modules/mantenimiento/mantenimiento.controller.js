import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- ÁREAS ---
async function obtenerAreas(req, res) {
  try {
    const areas = await prisma.area.findMany({ include: { puestos: true } });
    res.json({ exito: true, data: areas });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al obtener áreas" });
  }
}

async function crearArea(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    const nuevaArea = await prisma.area.create({
      data: { nombre, descripcion },
    });
    res.json({ exito: true, mensaje: "¡Área creada exitosamente!", data: nuevaArea });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al crear área (el nombre ya podría existir)" });
  }
}

// --- PUESTOS ---
async function crearPuesto(req, res) {
  try {
    const { nombre, areaId } = req.body;
    const nuevoPuesto = await prisma.puesto.create({
      data: { nombre, areaId: Number(areaId) },
    });
    res.json({ exito: true, mensaje: "¡Puesto creado exitosamente!", data: nuevoPuesto });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al crear puesto" });
  }
}

export { obtenerAreas, crearArea, crearPuesto };