
BEGIN TRANSACTION;

ALTER TABLE "Candidato"
ADD COLUMN "direccion" TEXT;

ALTER TABLE "Candidato"
ADD COLUMN "referencias" TEXT;

ALTER TABLE "Candidato"
ADD COLUMN "fotoArchivo" TEXT;

COMMIT;
