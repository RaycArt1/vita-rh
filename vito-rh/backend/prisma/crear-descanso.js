
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Descanso" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "fecha" DATETIME NOT NULL,
      "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "empleadoId" INTEGER NOT NULL,
      "creadoPorId" INTEGER NOT NULL,
      CONSTRAINT "Descanso_empleadoId_fkey"
        FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
      CONSTRAINT "Descanso_creadoPorId_fkey"
        FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Descanso_empleadoId_fecha_key"
    ON "Descanso" ("empleadoId", "fecha");
  `);

  console.log("Tabla Descanso creada o ya existente.");
} catch (error) {
  console.error("No se pudo crear la tabla Descanso:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
