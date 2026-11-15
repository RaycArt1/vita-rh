-- AlterTable
ALTER TABLE "ReporteIncidencia" ADD COLUMN "empleadoId" INTEGER REFERENCES "Empleado" ("id") ON DELETE SET NULL ON UPDATE CASCADE;