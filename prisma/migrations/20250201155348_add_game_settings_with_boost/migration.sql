/*
  Warnings:

  - Changed the type of `key` on the `game_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GameSettingKey" AS ENUM ('DAILY_REWARD_AMOUNT', 'BOOST_DROP_RATE_START', 'BOOST_DROP_RATE_END', 'BOOST_DROP_RATE_ENABLED');

-- AlterTable
ALTER TABLE "game_settings" DROP COLUMN "key",
ADD COLUMN     "key" "GameSettingKey" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "game_settings_key_key" ON "game_settings"("key");
