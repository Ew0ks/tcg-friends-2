/*
  Warnings:

  - You are about to drop the column `shiny` on the `Card` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rarity` on the `Card` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `CollectedCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "BoosterType" AS ENUM ('STANDARD', 'RARE', 'LEGENDARY');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "shiny",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "rarity",
ADD COLUMN     "rarity" "Rarity" NOT NULL;

-- AlterTable
ALTER TABLE "CollectedCard" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isShiny" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "legendaryCardsFound" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shinyCardsFound" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalBoostersOpened" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "BoosterPurchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "BoosterType" NOT NULL,
    "cost" INTEGER NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoosterPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardFromBooster" (
    "id" SERIAL NOT NULL,
    "boosterId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "isShiny" BOOLEAN NOT NULL,

    CONSTRAINT "CardFromBooster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoosterConfig" (
    "id" SERIAL NOT NULL,
    "type" "BoosterType" NOT NULL,
    "cost" INTEGER NOT NULL,
    "cardCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoosterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoosterConfig_type_key" ON "BoosterConfig"("type");

-- AddForeignKey
ALTER TABLE "BoosterPurchase" ADD CONSTRAINT "BoosterPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardFromBooster" ADD CONSTRAINT "CardFromBooster_boosterId_fkey" FOREIGN KEY ("boosterId") REFERENCES "BoosterPurchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardFromBooster" ADD CONSTRAINT "CardFromBooster_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
