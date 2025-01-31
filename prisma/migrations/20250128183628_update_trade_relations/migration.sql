/*
  Warnings:

  - You are about to drop the `TradeCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TradeOffer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TradeCard" DROP CONSTRAINT "TradeCard_cardId_fkey";

-- DropForeignKey
ALTER TABLE "TradeCard" DROP CONSTRAINT "offered_cards";

-- DropForeignKey
ALTER TABLE "TradeCard" DROP CONSTRAINT "requested_cards";

-- DropForeignKey
ALTER TABLE "TradeOffer" DROP CONSTRAINT "TradeOffer_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "TradeOffer" DROP CONSTRAINT "TradeOffer_recipientId_fkey";

-- DropTable
DROP TABLE "TradeCard";

-- DropTable
DROP TABLE "TradeOffer";

-- CreateTable
CREATE TABLE "trade_offers" (
    "id" SERIAL NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "status" "TradeStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_cards" (
    "id" SERIAL NOT NULL,
    "tradeOfferId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "isShiny" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isOffered" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "trade_cards_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_cards" ADD CONSTRAINT "trade_cards_tradeOfferId_fkey" FOREIGN KEY ("tradeOfferId") REFERENCES "trade_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_cards" ADD CONSTRAINT "trade_cards_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
