-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isPublic" SET DEFAULT true;

-- CreateTable
CREATE TABLE "TradeOffer" (
    "id" SERIAL NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeCard" (
    "id" SERIAL NOT NULL,
    "tradeOfferId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "isShiny" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isOffered" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TradeCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TradeOffer" ADD CONSTRAINT "TradeOffer_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeOffer" ADD CONSTRAINT "TradeOffer_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeCard" ADD CONSTRAINT "offered_cards" FOREIGN KEY ("tradeOfferId") REFERENCES "TradeOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeCard" ADD CONSTRAINT "requested_cards" FOREIGN KEY ("tradeOfferId") REFERENCES "TradeOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeCard" ADD CONSTRAINT "TradeCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
