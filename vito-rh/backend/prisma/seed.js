import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Área
  const area = await prisma.area.upsert({
    where: { nombre: "Administración" },
    update: {},
    create: {
      nombre: "Administración",
    },
  });

  // Puesto
  const puesto = await prisma.puesto.create({
    data: {
      nombre: "Administrador",
      areaId: area.id,
    },
  }).catch(async () => {
    return prisma.puesto.findFirst({
      where: {
        nombre: "Administrador",
        areaId: area.id,
      },
    });
  });

  // Contraseña
  const password = await bcrypt.hash("admin123", 10);

  // Empleado
  const empleado = await prisma.empleado.upsert({
    where: {
      correo: "admin@vito.com",
    },
    update: {},
    create: {
      nombres: "Administrador",
      apellidos: "Sistema",
      identidad: "0000000000000",
      telefono: "99999999",
      correo: "admin@vito.com",
      fechaIngreso: new Date(),
      puestoId: puesto.id,
    },
  });

  // Usuario
  await prisma.usuario.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      username: "admin",
      password,
      rol: "ADMIN",
      empleadoId: empleado.id,
    },
  });

  // Turnos
  const turnos = [
    {
      nombre: "Mañana",
      horaInicio: "08:00",
      horaFin: "16:00",
    },
    {
      nombre: "Tarde",
      horaInicio: "16:00",
      horaFin: "22:00",
    },
    {
      nombre: "Noche",
      horaInicio: "22:00",
      horaFin: "06:00",
    },
  ];

  for (const turno of turnos) {
    const existe = await prisma.turno.findFirst({
      where: { nombre: turno.nombre },
    });

    if (!existe) {
      await prisma.turno.create({
        data: turno,
      });
    }
  }

  console.log("✅ Base de datos inicializada correctamente");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });