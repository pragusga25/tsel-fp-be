-- CreateEnum
CREATE TYPE "FreezeTimeStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'PENDING');

-- AlterTable
ALTER TABLE "FreezeTime" ADD COLUMN     "status" "FreezeTimeStatus" NOT NULL DEFAULT 'PENDING';
