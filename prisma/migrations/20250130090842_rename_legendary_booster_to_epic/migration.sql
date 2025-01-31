/*
  Warnings:

  - The values [LEGENDARY] on the enum `BoosterType` will be removed. If these variants are still used in the database, this will fail.

*/
-- Créer un nouveau type d'enum avec les valeurs souhaitées
CREATE TYPE "BoosterType_new" AS ENUM ('STANDARD', 'RARE', 'EPIC');

-- Convertir les données existantes
ALTER TABLE "BoosterConfig" 
  ALTER COLUMN "type" TYPE "BoosterType_new" 
  USING (CASE WHEN "type"::text = 'LEGENDARY' THEN 'EPIC'::text ELSE "type"::text END)::"BoosterType_new";

ALTER TABLE "BoosterPurchase" 
  ALTER COLUMN "type" TYPE "BoosterType_new" 
  USING (CASE WHEN "type"::text = 'LEGENDARY' THEN 'EPIC'::text ELSE "type"::text END)::"BoosterType_new";

-- Supprimer l'ancien type et renommer le nouveau
DROP TYPE "BoosterType";
ALTER TYPE "BoosterType_new" RENAME TO "BoosterType";
