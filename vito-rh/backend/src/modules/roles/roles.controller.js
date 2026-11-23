import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. Listar todos los roles
export const listarRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { usuarios: true }
        }
      }
    });

    const rolesConPermisos = await Promise.all(
      roles.map(async (rol) => {
        const permisos = await prisma.permisoRol.findMany({
          where: { roleId: rol.id }
        });
        return { ...rol, permisos };
      })
    );

    res.json(rolesConPermisos);
  } catch (error) {
    console.error("Error al listar roles:", error);
    res.status(500).json({ error: 'Error al listar roles', detalle: error.message });
  }
};

// 2. Crear un nuevo rol
export const crearRol = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    const nuevoRol = await prisma.role.create({
      data: {
        nombre,
        descripcion
      }
    });

    res.status(201).json(nuevoRol);
  } catch (error) {
    console.error("Error al crear rol:", error);
    res.status(500).json({ error: 'Error al crear el rol', detalle: error.message });
  }
};

// 3. Obtener los permisos de un rol específico
export const obtenerPermisosRol = async (req, res) => {
  try {
    const { id } = req.params;

    const permisos = await prisma.permisoRol.findMany({
      where: { roleId: Number(id) }
    });

    res.json(permisos);
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    res.status(500).json({ error: 'Error al obtener permisos del rol', detalle: error.message });
  }
};

// 4. Guardar o actualizar los permisos de un rol
export const guardarPermisosRol = async (req, res) => {
  try {
    const { id } = req.params;
    const listaPermisos = req.body.permisos || req.body;

    if (!Array.isArray(listaPermisos)) {
      return res.status(400).json({ error: 'El formato de permisos es inválido.' });
    }

    for (const p of listaPermisos) {
      // Soportamos tanto si viene como objeto { modulo, visible } o como string directo ("empleados")
      const moduloNombre = typeof p === 'object' ? p.modulo : p;
      const visibleValor = typeof p === 'object' ? (p.visible ?? true) : true;

      if (!moduloNombre) continue; // Evita procesar valores vacíos

      await prisma.permisoRol.upsert({
        where: {
          roleId_modulo: {
            roleId: Number(id),
            modulo: moduloNombre
          }
        },
        update: { 
          visible: visibleValor 
        },
        create: {
          roleId: Number(id),
          modulo: moduloNombre,
          visible: visibleValor
        }
      });
    }

    res.json({ mensaje: 'Permisos guardados exitosamente' });
  } catch (error) {
    console.error("Error al guardar permisos:", error);
    res.status(500).json({ error: 'Error al guardar permisos del rol', detalle: error.message });
  }
};