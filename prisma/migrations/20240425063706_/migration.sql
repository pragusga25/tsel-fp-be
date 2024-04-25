-- CreateEnum
CREATE TYPE "AssignmentOperation" AS ENUM ('ATTACH', 'DETACH');

-- AlterTable
ALTER TABLE "AssignmentRequest" ADD COLUMN     "operation" "AssignmentOperation" NOT NULL DEFAULT 'ATTACH';
