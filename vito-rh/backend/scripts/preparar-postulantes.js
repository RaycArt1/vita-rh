// Preparación ADITIVA e idempotente de SQLite para instalaciones locales de Vita RH.
// No elimina tablas, empleados, candidatos ni registros existentes.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function existeTabla(nombre) {
  const filas = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", nombre);
  return filas.length > 0;
}
async function agregarSiFalta(tabla, columna, definicion) {
  const columnas = await prisma.$queryRawUnsafe(`PRAGMA table_info("${tabla}")`);
  if (!columnas.some((c) => c.name === columna)) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "${tabla}" ADD COLUMN "${columna}" ${definicion}`);
    console.log(`  ✓ ${tabla}.${columna}`);
  }
}

try {
  for (const tabla of ["Area", "Candidato", "Empleado", "Oferta", "Entrevista"]) {
    if (!(await existeTabla(tabla))) {
      throw new Error(`Falta la tabla ${tabla}. Primero crea la base inicial con las migraciones originales.`);
    }
  }
  console.log("Preparando tablas de vacantes y postulantes…");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Vacante" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "nombre" TEXT NOT NULL,
      "descripcion" TEXT NOT NULL,
      "areaId" INTEGER NOT NULL,
      "activa" BOOLEAN NOT NULL DEFAULT true,
      "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "plazasTotales" INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )
  `);
  await agregarSiFalta("Vacante", "plazasTotales", "INTEGER NOT NULL DEFAULT 1");

  for (const campo of ["direccion", "referencias", "fotoArchivo", "identidad"]) {
    await agregarSiFalta("Candidato", campo, "TEXT");
  }
  await agregarSiFalta("Candidato", "vacanteId", 'INTEGER REFERENCES "Vacante"("id") ON DELETE SET NULL ON UPDATE CASCADE');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Postulante" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "nombre" TEXT NOT NULL,
      "apellido" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "telefono" TEXT,
      "direccion" TEXT,
      "referencias" TEXT,
      "observaciones" TEXT,
      "fotoArchivo" TEXT,
      "candidatoId" INTEGER,
      "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("candidatoId") REFERENCES "Candidato"("id") ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Postulante_email_key" ON "Postulante"("email")');
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Postulante_candidatoId_key" ON "Postulante"("candidatoId")');
  // Los permisos de los roles se consultan al abrir Usuarios y Roles.
  // Esta tabla puede faltar en bases locales recuperadas de ramas anteriores.
  if (!(await existeTabla("Role"))) {
    throw new Error('Falta la tabla "Role"; revisa las migraciones originales de roles antes de continuar.');
  }
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PermisoRol" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "roleId" INTEGER NOT NULL,
      "modulo" TEXT NOT NULL,
      "visible" BOOLEAN NOT NULL DEFAULT false,
      CONSTRAINT "PermisoRol_roleId_fkey" FOREIGN KEY ("roleId")
        REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "PermisoRol_roleId_modulo_key"
    ON "PermisoRol"("roleId", "modulo")
  `);
  console.log("  ✓ Tabla PermisoRol verificada");

  console.log("✅ Estructura verificada. No se borraron datos.");
} catch (error) {
  console.error("❌ No se pudo preparar Reclutamiento:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
