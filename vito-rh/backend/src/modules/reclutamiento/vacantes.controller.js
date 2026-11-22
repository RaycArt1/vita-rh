import prisma from "../../config/prisma.js";


export const obtenerVacantes = async (req, res) => {
  try {
    const vacantes = await prisma.vacante.findMany({
      where: { activa: true },
      orderBy: { fechaCreacion: "desc" },
      include: {
        area: true,
        _count: {
          select: {
            candidatos: {
              where: {
                estado: "CONTRATADO",
                empleado: { isNot: null },
              },
            },
          },
        },
      },
    });

    const resultado = vacantes.map((vacante) => {
      const plazasCubiertas = vacante._count.candidatos;
      const plazasDisponibles = Math.max(
        0,
        vacante.plazasTotales - plazasCubiertas
      );

      const { _count, ...datosVacante } = vacante;

      return {
        ...datosVacante,
        plazasCubiertas,
        plazasDisponibles,
        estadoVacante:
          plazasDisponibles === 0
            ? "CUBIERTA"
            : "DISPONIBLE",
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener vacantes:", error);

    res.status(500).json({
      mensaje: "Error al obtener las vacantes",
    });
  }
};


export const crearVacante = async (req, res) => {
  try {
    const nombre = String(req.body.nombre ?? "").trim();
    const descripcion = String(req.body.descripcion ?? "").trim();
    const areaId = Number(req.body.areaId);
    const plazasTotales = Number(req.body.plazasTotales ?? 1);

    if (!nombre || !descripcion || !Number.isInteger(areaId) || areaId <= 0) {
      return res.status(400).json({
        mensaje: "Nombre, área y descripción son obligatorios",
      });
    }

    if (nombre.length > 100) {
      return res.status(400).json({
        mensaje: "El nombre de la vacante no puede superar 100 caracteres",
      });
    }

    const area = await prisma.area.findUnique({ where: { id: areaId } });

    if (!area) {
      return res.status(400).json({
        mensaje: "El área seleccionada no existe",
      });
    }

if (!Number.isSafeInteger(plazasTotales) || plazasTotales < 1) {
  return res.status(400).json({
    mensaje: "La cantidad de plazas debe ser un número entero mayor que cero",
  });
}

    
    // Vacante y bitácora en una sola transacción: si una falla, no se guarda nada
    const vacante = await prisma.$transaction(async (tx) => {
      const nueva = await tx.vacante.create({
        data: { nombre, descripcion, areaId, plazasTotales },
        include: { area: true },
      });

      await tx.bitacora.create({
        data: {
          usuarioId: req.usuario.id,
          accion: "INSERT",
          tablaAfectada: "Vacante",
          idRegistro: nueva.id,
          descripcion: `Vacante "${nueva.nombre}" creada en el área ${area.nombre}`,
          ipOrigen: req.ip,
        },
      });

      return nueva;
    });

    res.status(201).json(vacante);
  } catch (error) {
    console.error("Error al crear vacante:", error);

    res.status(500).json({
      mensaje: "Error al crear la vacante",
    });
  }
};
