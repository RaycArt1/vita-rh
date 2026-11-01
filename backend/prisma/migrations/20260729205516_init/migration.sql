-- CreateTable
CREATE TABLE "Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Puesto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    CONSTRAINT "Puesto_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "identidad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "fechaIngreso" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "puestoId" INTEGER NOT NULL,
    CONSTRAINT "Empleado_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    CONSTRAINT "Usuario_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "turnoId" INTEGER NOT NULL,
    CONSTRAINT "Horario_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Horario_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vacacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "motivo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "empleadoId" INTEGER NOT NULL,
    CONSTRAINT "Vacacion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LlamadoAtencion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "empleadoId" INTEGER NOT NULL,
    CONSTRAINT "LlamadoAtencion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expediente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contrato" TEXT,
    "identidadArchivo" TEXT,
    "confidencialidad" TEXT,
    "hojaVida" TEXT,
    "observaciones" TEXT,
    "empleadoId" INTEGER NOT NULL,
    CONSTRAINT "Expediente_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_nombre_key" ON "Area"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_identidad_key" ON "Empleado"("identidad");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_correo_key" ON "Empleado"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_empleadoId_key" ON "Usuario"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "Expediente_empleadoId_key" ON "Expediente"("empleadoId");
