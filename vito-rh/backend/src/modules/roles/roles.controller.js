import prisma from "../../config/prisma.js";

// Listar todos los roles
export async function listarRoles(req, res) {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: "asc" },
    });
    res.json(roles);
  } catch (error) {
    console.error("Error al listar roles:", error);
    res.status(500).json({ mensaje: "Error interno al obtener los roles." });
  }
}

// Crear un nuevo rol
export async function crearRol(req, res) {
  try {
    const nombre = String(req.body.nombre ?? "").trim().toUpperCase();
    const descripcion = String(req.body.descripcion ?? "").trim();

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre del rol es obligatorio." });
    }

    const rolExistente = await prisma.role.findFirst({
      where: { nombre },
    });

    if (rolExistente) {
      return res.status(409).json({ mensaje: "Ya existe un rol con ese nombre." });
    }

    const nuevoRol = await prisma.role.create({
      data: {
        nombre,
        descripcion,
      },
    });

    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ mensaje: "Error interno al crear el rol." });
  }
}