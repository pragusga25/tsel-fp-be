/*
  Warnings:

  - You are about to drop the column `permissionSetArns` on the `AssignmentRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssignmentRequest" DROP COLUMN "permissionSetArns",
ADD COLUMN     "permissionSets" JSONB[];
