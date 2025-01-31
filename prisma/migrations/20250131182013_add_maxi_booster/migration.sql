-- AlterEnum
ALTER TYPE "BoosterType" ADD VALUE 'MAXI';

-- InsertData
INSERT INTO "BoosterConfig" ("type", "cost", "cardCount", "updatedAt")
VALUES ('MAXI', 400, 8, NOW())
ON CONFLICT ("type") DO UPDATE 
SET "cost" = 400, "cardCount" = 8, "updatedAt" = NOW();
