-- AlterTable
ALTER TABLE "LlamadoAtencion" ADD COLUMN "reporteId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "LlamadoAtencion_reporteId_key" ON "LlamadoAtencion"("reporteId");