
CREATE TABLE "Oferta" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "candidatoId" INTEGER NOT NULL,
  "tipoContrato" TEXT NOT NULL,
  "salario" DECIMAL NOT NULL,
  "fechaInicio" DATETIME NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
  "fechaOferta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaRespuesta" DATETIME,

  CONSTRAINT "Oferta_candidatoId_fkey"
    FOREIGN KEY ("candidatoId")
    REFERENCES "Candidato" ("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Oferta_candidatoId_key"
ON "Oferta"("candidatoId");
