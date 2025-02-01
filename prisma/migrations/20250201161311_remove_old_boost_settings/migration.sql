/*
  Warnings:

  - The values [BOOST_DROP_RATE_START,BOOST_DROP_RATE_END,BOOST_DROP_RATE_ENABLED] on the enum `GameSettingKey` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameSettingKey_new" AS ENUM ('DAILY_REWARD_AMOUNT');
ALTER TABLE "game_settings" ALTER COLUMN "key" TYPE "GameSettingKey_new" USING ("key"::text::"GameSettingKey_new");
ALTER TYPE "GameSettingKey" RENAME TO "GameSettingKey_old";
ALTER TYPE "GameSettingKey_new" RENAME TO "GameSettingKey";
DROP TYPE "GameSettingKey_old";
COMMIT;
