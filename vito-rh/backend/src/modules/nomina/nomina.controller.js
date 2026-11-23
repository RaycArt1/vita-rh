import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();




// 1. Obtener todas las planillas con sus detalles y empleados
export const obtenerPlanillas = async (req, res) => {
  try {
    const planillas = await prisma.planillaNomina.findMany({
      orderBy: { id: 'desc' },
      include: {
        detalles: {
          include: {
            empleado: {
              include: { puesto: true }
            }
          }
        }
      }
    });
    res.json(planillas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener planillas', detalle: error.message });
  }
};




// 2. Crear nueva planilla automática con empleados activos
export const crearPlanilla = async (req, res) => {
  try {
    const { periodo, creadoPorId } = req.body; // Ej: "Agosto 2026"




    const empleadosActivos = await prisma.empleado.findMany({
      where: { estado: 'ACTIVO' }
    });




    if (empleadosActivos.length === 0) {
      return res.status(400).json({ error: 'No hay empleados activos para generar planilla.' });
    }




    let totalBruto = 0;
    const detallesData = empleadosActivos.map((emp) => {
      totalBruto += emp.salarioBase;
      return {
        empleadoId: emp.id,
        salarioBase: emp.salarioBase,
        horasExtra: 0,
        montoHorasEx: 0,
        bonos: 0,
        deducciones: 0,
        salarioNeto: emp.salarioBase,
        estado: 'PENDIENTE'
      };
    });




    const nuevaPlanilla = await prisma.planillaNomina.create({
      data: {
        periodo,
        totalBruto,
        totalNeto: totalBruto,
        totalDeduccion: 0,
        porProcesar: empleadosActivos.length,
        creadoPorId: Number(creadoPorId) || 1,
        detalles: {
          create: detallesData
        }
      },
      include: {
        detalles: {
          include: { empleado: { include: { puesto: true } } }
        }
      }
    });




    res.status(201).json(nuevaPlanilla);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la planilla', detalle: error.message });
  }
};




// 3. Actualizar un renglón individual (horas extra, bonos, deducciones)
export const actualizarDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { horasExtra, montoHorasEx, bonos, conceptoBono, deducciones } = req.body;




    const detalleActual = await prisma.detallePlanillaNomina.findUnique({
      where: { id: Number(id) }
    });




    if (!detalleActual) {
      return res.status(404).json({ error: 'Detalle de nómina no encontrado' });
    }




    const salarioNeto =
      detalleActual.salarioBase +
      Number(montoHorasEx || 0) +
      Number(bonos || 0) -
      Number(deducciones || 0);




    const actualizado = await prisma.detallePlanillaNomina.update({
      where: { id: Number(id) },
      data: {
        horasExtra: Number(horasExtra || 0),
        montoHorasEx: Number(montoHorasEx || 0),
        bonos: Number(bonos || 0),
        conceptoBono,
        deducciones: Number(deducciones || 0),
        salarioNeto
      }
    });




    await recalcularTotalesPlanilla(detalleActual.planillaId);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar detalle', detalle: error.message });
  }
};




// 4. Cambiar estado individual (PENDIENTE -> PROCESADO -> PAGADO)
export const cambiarEstadoDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;




    const actualizado = await prisma.detallePlanillaNomina.update({
      where: { id: Number(id) },
      data: { estado }
    });




    await recalcularTotalesPlanilla(actualizado.planillaId);
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado', detalle: error.message });
  }
};




// 5. Procesar todos los pendientes de una planilla (Botón "Procesar")
export const procesarTodos = async (req, res) => {
  try {
    const { planillaId } = req.params;




    await prisma.detallePlanillaNomina.updateMany({
      where: {
        planillaId: Number(planillaId),
        estado: 'PENDIENTE'
      },
      data: { estado: 'PROCESADO' }
    });




    await recalcularTotalesPlanilla(Number(planillaId));
    res.json({ mensaje: 'Todos los registros pendientes fueron procesados' });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar en lote', detalle: error.message });
  }
};




// Función auxiliar privada para mantener cuadradas las 4 tarjetas superiores
async function recalcularTotalesPlanilla(planillaId) {
  const detalles = await prisma.detallePlanillaNomina.findMany({
    where: { planillaId }
  });




  let totalBruto = 0;
  let totalDeduccion = 0;
  let totalNeto = 0;
  let porProcesar = 0;




  detalles.forEach((d) => {
    totalBruto += d.salarioBase + d.montoHorasEx + d.bonos;
    totalDeduccion += d.deducciones;
    totalNeto += d.salarioNeto;
    if (d.estado === 'PENDIENTE') porProcesar++;
  });




  await prisma.planillaNomina.update({
    where: { id: planillaId },
    data: { totalBruto, totalDeduccion, totalNeto, porProcesar }
  });
}
