/*
  Warnings:

  - Made the column `creatorId` on table `FreezeTime` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FreezeTime" ALTER COLUMN "creatorId" SET NOT NULL;
