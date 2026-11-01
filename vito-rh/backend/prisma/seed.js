import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Áreas y puestos iniciales de Vito RH.
  const estructura = [
    {
      nombre: "Administración",
      puestos: [
        "Administrador",
        "Gerente de operaciones",
        "Asistente administrativo",
        "Supervisor",
      ],
    },
    {
      nombre: "Cocina",
      puestos: [
        "Chef ejecutivo",
        "Pizzero",
        "Cocinero",
        "Auxiliar de cocina",
      ],
    },
    {
      nombre: "Servicio al cliente",
      puestos: [
        "Mesero/a",
        "Cajero/a",
        "Supervisor de servicio",
      ],
    },
    {
      nombre: "Limpieza y mantenimiento",
      puestos: [
        "Personal de limpieza",
        "Auxiliar de mantenimiento",
      ],
    },
  ];

  // Crear las áreas y sus puestos.
  for (const item of estructura) {
    const area = await prisma.area.upsert({
      where: { nombre: item.nombre },
      update: {},
      create: { nombre: item.nombre },
    });

    for (const nombrePuesto of item.puestos) {
      const existente = await prisma.puesto.findFirst({
        where: {
          nombre: nombrePuesto,
          areaId: area.id,
        },
      });

      if (!existente) {
        await prisma.puesto.create({
          data: {
            nombre: nombrePuesto,
            areaId: area.id,
          },
        });
      }
    }
  }

  // Obtener Administración y el puesto Administrador.
  const areaAdmin = await prisma.area.findUnique({
    where: { nombre: "Administración" },
  });

  const puestoAdmin = await prisma.puesto.findFirst({
    where: {
      nombre: "Administrador",
      areaId: areaAdmin.id,
    },
  });

  // Crear el empleado de prueba si todavía no existe.
  const empleado = await prisma.empleado.upsert({
    where: { correo: "admin@vito.com" },
    update: {},
    create: {
      nombres: "Administrador",
      apellidos: "Sistema",
      identidad: "0000000000000",
      telefono: "99999999",
      correo: "admin@vito.com",
      puestoId: puestoAdmin.id,
      areaId: areaAdmin.id,
      salarioBase: 0,
      fechaIngreso: new Date(),
    },
  });

  // Crear o asegurar el rol ADMINISTRADOR en la tabla Role
  const rolAdmin = await prisma.role.upsert({
    where: { nombre: "ADMINISTRADOR" },
    update: {},
    create: {
      nombre: "ADMINISTRADOR",
      descripcion: "Administrador general del sistema",
    },
  });

  // Crear el usuario administrador usando roleId de forma dinámica
  const password = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { username: "admin" },
    update: {
      password: password,
      roleId: rolAdmin.id,
    },
    create: {
      username: "admin",
      password,
      roleId: rolAdmin.id,
      empleadoId: empleado.id,
    },
  });

  console.log("✅ Áreas, puestos, roles y usuario inicializados correctamente.");
}

main()
  .catch((error) => {
    console.error("Error al inicializar la base de datos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });