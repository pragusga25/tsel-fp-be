-- AlterTable
ALTER TABLE "FreezeTime" ADD COLUMN     "isExecutedAtEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isExecutedAtStart" BOOLEAN NOT NULL DEFAULT false;
