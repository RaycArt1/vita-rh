import prisma from "../../config/prisma.js";

const formatear = (vacante) => {
  const plazasCubiertas = vacante._count?.candidatos ?? 0;
  const plazasDisponibles = Math.max(0, vacante.plazasTotales - plazasCubiertas);
  const { _count, ...datos } = vacante;
  return {
    ...datos,
    plazasCubiertas,
    plazasDisponibles,
    estadoVacante: plazasDisponibles > 0 ? "DISPONIBLE" : "CUBIERTA",
  };
};

export async function obtenerVacantes(req, res) {
  try {
    const vacantes = await prisma.vacante.findMany({
      where: { activa: true },
      include: {
        area: { select: { id: true, nombre: true } },
        _count: {
          select: {
            candidatos: {
              where: { estado: "CONTRATADO", empleado: { isNot: null } },
            },
          },
        },
      },
      orderBy: { fechaCreacion: "desc" },
    });
    return res.json(vacantes.map(formatear));
  } catch (error) {
    console.error("No se pudieron consultar vacantes:", error);
    return res.status(500).json({ mensaje: "No se pudieron consultar las vacantes." });
  }
}

export async function crearVacante(req, res) {
  try {
    const nombre = String(req.body.nombre ?? "").trim();
    const descripcion = String(req.body.descripcion ?? "").trim();
    const areaId = Number(req.body.areaId);
    const plazasTotales = Number(req.body.plazasTotales ?? 1);
    if (!nombre || !descripcion || !Number.isInteger(areaId) || areaId < 1 || !Number.isInteger(plazasTotales) || plazasTotales < 1) {
      return res.status(400).json({ mensaje: "Completa nombre, descripción, área y cantidad de plazas válidas." });
    }
    const area = await prisma.area.findUnique({ where: { id: areaId } });
    if (!area) return res.status(404).json({ mensaje: "El área seleccionada no existe." });
    const creada = await prisma.vacante.create({
      data: { nombre, descripcion, areaId, plazasTotales },
      include: { area: { select: { id: true, nombre: true } } },
    });
    return res.status(201).json({ ...creada, plazasCubiertas: 0, plazasDisponibles: creada.plazasTotales, estadoVacante: "DISPONIBLE" });
  } catch (error) {
    console.error("No se pudo crear vacante:", error);
    return res.status(500).json({ mensaje: "No se pudo registrar la vacante." });
  }
}
