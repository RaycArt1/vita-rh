-- CreateTable
CREATE TABLE "ReporteIncidencia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empleado" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "gravedad" TEXT NOT NULL,
    "supervisor" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "seguimiento" TEXT,
    "documentoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
