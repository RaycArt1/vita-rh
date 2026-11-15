
CREATE TABLE "Evaluacion" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "candidatoId" INTEGER NOT NULL,
  "puntuacion" INTEGER NOT NULL,
  "clasificacion" TEXT NOT NULL,
  "observaciones" TEXT NOT NULL,
  "resultado" TEXT NOT NULL DEFAULT 'PENDIENTE',
  "fechaEvaluacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Evaluacion_candidatoId_fkey"
    FOREIGN KEY ("candidatoId")
    REFERENCES "Candidato" ("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Evaluacion_candidatoId_key"
ON "Evaluacion"("candidatoId");
