/*
  Warnings:

  - You are about to drop the column `status` on the `FreezeTime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FreezeTime" DROP COLUMN "status";

-- DropEnum
DROP TYPE "FreezeTimeStatus";
