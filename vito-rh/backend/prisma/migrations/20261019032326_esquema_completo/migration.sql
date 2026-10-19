/*
  Warnings:

  - You are about to drop the `Turno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vacacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `confidencialidad` on the `Expediente` table. All the data in the column will be lost.
  - You are about to drop the column `contrato` on the `Expediente` table. All the data in the column will be lost.
  - You are about to drop the column `hojaVida` on the `Expediente` table. All the data in the column will be lost.
  - You are about to drop the column `identidadArchivo` on the `Expediente` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `Expediente` table. All the data in the column will be lost.
  - You are about to drop the column `fecha` on the `Horario` table. All the data in the column will be lost.
  - You are about to drop the column `turnoId` on the `Horario` table. All the data in the column will be lost.
  - You are about to drop the column `motivo` on the `LlamadoAtencion` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `LlamadoAtencion` table. All the data in the column will be lost.
  - Added the required column `areaId` to the `Empleado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salarioBase` to the `Empleado` table without a default value. This is not possible if the table is not empty.
  - Added the required column `archivo` to the `Expediente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cargadoPorId` to the `Expediente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumento` to the `Expediente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `areaId` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creadoPorId` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaFin` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaInicio` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turno` to the `Horario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descripcionFalta` to the `LlamadoAtencion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emisorId` to the `LlamadoAtencion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroLlamado` to the `LlamadoAtencion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoFalta` to the `LlamadoAtencion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Area" ADD COLUMN "descripcion" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Turno";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Vacacion";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Candidato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "puestoAplicado" TEXT NOT NULL,
    "cvArchivo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'EN_PROCESO',
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Entrevista" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fase" INTEGER NOT NULL,
    "resultado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "fecha" DATETIME NOT NULL,
    "candidatoId" INTEGER NOT NULL,
    "entrevistadorId" INTEGER NOT NULL,
    CONSTRAINT "Entrevista_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entrevista_entrevistadorId_fkey" FOREIGN KEY ("entrevistadorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoSolicitud" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "motivo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "comentarioGerente" TEXT,
    "aprobadoPorId" INTEGER,
    "fechaSolicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empleadoId" INTEGER NOT NULL,
    CONSTRAINT "Solicitud_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Solicitud_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Nomina" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "periodoInicio" DATETIME NOT NULL,
    "periodoFin" DATETIME NOT NULL,
    "salarioBase" REAL NOT NULL,
    "deducciones" REAL NOT NULL DEFAULT 0,
    "bonificaciones" REAL NOT NULL DEFAULT 0,
    "salarioNeto" REAL NOT NULL,
    "fechaPago" DATETIME NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "registradoPorId" INTEGER NOT NULL,
    CONSTRAINT "Nomina_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Nomina_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaEnvio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tablaAfectada" TEXT NOT NULL,
    "idRegistro" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipOrigen" TEXT,
    "usuarioId" INTEGER NOT NULL,
    CONSTRAINT "Bitacora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Empleado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "identidad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "puestoId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "salarioBase" REAL NOT NULL,
    "fechaIngreso" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "fechaBaja" DATETIME,
    "motivoBaja" TEXT,
    "candidatoId" INTEGER,
    CONSTRAINT "Empleado_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Empleado_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Empleado_candidatoId_fkey" FOREIGN KEY ("candidatoId") REFERENCES "Candidato" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Empleado" ("apellidos", "correo", "estado", "fechaIngreso", "id", "identidad", "nombres", "puestoId", "telefono") SELECT "apellidos", "correo", "estado", "fechaIngreso", "id", "identidad", "nombres", "puestoId", "telefono" FROM "Empleado";
DROP TABLE "Empleado";
ALTER TABLE "new_Empleado" RENAME TO "Empleado";
CREATE UNIQUE INDEX "Empleado_identidad_key" ON "Empleado"("identidad");
CREATE UNIQUE INDEX "Empleado_correo_key" ON "Empleado"("correo");
CREATE UNIQUE INDEX "Empleado_candidatoId_key" ON "Empleado"("candidatoId");
CREATE TABLE "new_Expediente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipoDocumento" TEXT NOT NULL,
    "archivo" TEXT NOT NULL,
    "fechaCarga" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empleadoId" INTEGER NOT NULL,
    "cargadoPorId" INTEGER NOT NULL,
    CONSTRAINT "Expediente_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Expediente_cargadoPorId_fkey" FOREIGN KEY ("cargadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Expediente" ("empleadoId", "id") SELECT "empleadoId", "id" FROM "Expediente";
DROP TABLE "Expediente";
ALTER TABLE "new_Expediente" RENAME TO "Expediente";
CREATE TABLE "new_Horario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "turno" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "empleadoId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "creadoPorId" INTEGER NOT NULL,
    CONSTRAINT "Horario_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Horario_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Horario_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Horario" ("empleadoId", "id") SELECT "empleadoId", "id" FROM "Horario";
DROP TABLE "Horario";
ALTER TABLE "new_Horario" RENAME TO "Horario";
CREATE UNIQUE INDEX "Horario_empleadoId_fechaInicio_fechaFin_key" ON "Horario"("empleadoId", "fechaInicio", "fechaFin");
CREATE TABLE "new_LlamadoAtencion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descripcionFalta" TEXT NOT NULL,
    "tipoFalta" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "numeroLlamado" INTEGER NOT NULL,
    "firmadoEmpleado" BOOLEAN NOT NULL DEFAULT false,
    "empleadoId" INTEGER NOT NULL,
    "emisorId" INTEGER NOT NULL,
    CONSTRAINT "LlamadoAtencion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LlamadoAtencion_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LlamadoAtencion" ("empleadoId", "fecha", "id") SELECT "empleadoId", "fecha", "id" FROM "LlamadoAtencion";
DROP TABLE "LlamadoAtencion";
ALTER TABLE "new_LlamadoAtencion" RENAME TO "LlamadoAtencion";
CREATE TABLE "new_Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" DATETIME,
    "empleadoId" INTEGER NOT NULL,
    CONSTRAINT "Usuario_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Usuario" ("empleadoId", "id", "password", "rol", "username") SELECT "empleadoId", "id", "password", "rol", "username" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");
CREATE UNIQUE INDEX "Usuario_empleadoId_key" ON "Usuario"("empleadoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
