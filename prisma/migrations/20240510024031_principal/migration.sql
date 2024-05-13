/*
  Warnings:

  - You are about to drop the column `principalId` on the `AssignmentRequest` table. All the data in the column will be lost.
  - You are about to drop the column `principalType` on the `AssignmentRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssignmentRequest" DROP COLUMN "principalId",
DROP COLUMN "principalType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "principalDisplayName" TEXT;
