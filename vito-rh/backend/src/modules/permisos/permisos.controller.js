import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();




// Obtener todos los permisos del rol (ej. el Chef ID 7)
export const obtenerPermisosPorRol = async (req, res) => {
  try {
    const { roleId } = req.params;
    const permisos = await prisma.permisoRol.findMany({
      where: { roleId: Number(roleId) }
    });
    res.json(permisos);
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    res.status(500).json({ error: "Error al obtener los permisos" });
  }
};




// Guardar o actualizar de forma INDIVIDUAL sin tocar los demás módulos
export const guardarPermiso = async (req, res) => {
  try {
    const { roleId, modulo, visible } = req.body;




    if (!roleId || !modulo) {
      return res.status(400).json({ error: "El roleId y el módulo son obligatorios" });
    }




    const moduloLimpio = String(modulo).toLowerCase().trim();
    const idRol = Number(roleId);




    // El upsert busca por la pareja única (roleId + modulo).
    // Si ya existe, solo actualiza 'visible'. Si no existe, lo crea nuevo.
    // Esto garantiza que NUNCA se borren los permisos de los demás módulos.
    const permisoActualizado = await prisma.permisoRol.upsert({
      where: {
        roleId_modulo: {
          roleId: idRol,
          modulo: moduloLimpio,
        }
      },
      update: {
        visible: Boolean(visible)
      },
      create: {
        roleId: idRol,
        modulo: moduloLimpio,
        visible: Boolean(visible)
      }
    });

    return res.json({
      success: true,
      message: "Permiso actualizado exitosamente",
      permisoActualizado
    });

  } catch (error) {
    console.error("Error al guardar el permiso:", error);
    res.status(500).json({ error: "Error al guardar el permiso" });
  }
};
