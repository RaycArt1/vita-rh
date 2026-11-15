ALTER TABLE "Entrevista"
ADD COLUMN "modalidad" TEXT NOT NULL DEFAULT 'PRESENCIAL';

ALTER TABLE "Entrevista"
ADD COLUMN "indicaciones" TEXT;

ALTER TABLE "Entrevista"
ADD COLUMN "documentoArchivo" TEXT;