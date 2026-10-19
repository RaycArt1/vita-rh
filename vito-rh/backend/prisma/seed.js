import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Área (nombre es UNIQUE, así que upsert es seguro)
  const area = await prisma.area.upsert({
    where: { nombre: "Administración" },
    update: {},
    create: { nombre: "Administración" },
  });

  // Puesto (no tiene UNIQUE, así que se busca antes de crear)
  let puesto = await prisma.puesto.findFirst({
    where: { nombre: "Administrador", areaId: area.id },
  });
  if (!puesto) {
    puesto = await prisma.puesto.create({
      data: { nombre: "Administrador", areaId: area.id },
    });
  }

  // Empleado de prueba (correo es UNIQUE)
  const empleado = await prisma.empleado.upsert({
    where: { correo: "admin@vito.com" },
    update: {},
    create: {
      nombres: "Administrador",
      apellidos: "Sistema",
      identidad: "0000000000000",
      telefono: "99999999",
      correo: "admin@vito.com",
      puestoId: puesto.id,
      areaId: area.id,
      salarioBase: 0,
      fechaIngreso: new Date(),
    },
  });

  // Usuario de prueba con rol GERENTE (username es UNIQUE)
  const password = await bcrypt.hash("admin123", 10);
  await prisma.usuario.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password,
      rol: "GERENTE",
      empleadoId: empleado.id,
    },
  });

  console.log("✅ Base de datos inicializada correctamente");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });