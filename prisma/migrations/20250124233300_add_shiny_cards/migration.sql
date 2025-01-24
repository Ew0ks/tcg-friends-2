/*
  Warnings:

  - You are about to drop the column `openedAt` on the `BoosterPurchase` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,cardId,isShiny]` on the table `CollectedCard` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BoosterPurchase" DROP COLUMN "openedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CardFromBooster" ALTER COLUMN "isShiny" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "CollectedCard_userId_cardId_isShiny_key" ON "CollectedCard"("userId", "cardId", "isShiny");
