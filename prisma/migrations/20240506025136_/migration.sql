-- CreateEnum
CREATE TYPE "FreezeTimeTarget" AS ENUM ('USER', 'GROUP', 'ALL');

-- AlterTable
ALTER TABLE "FreezeTime" ADD COLUMN     "permissionSets" JSONB[],
ADD COLUMN     "target" "FreezeTimeTarget" NOT NULL DEFAULT 'ALL';
