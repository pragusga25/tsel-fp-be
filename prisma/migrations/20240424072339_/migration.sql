/*
  Warnings:

  - You are about to drop the column `awsAccessKeyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `awsSecretAccessKey` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssignmentRequest" DROP CONSTRAINT "AssignmentRequest_requesterId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "awsAccessKeyId",
DROP COLUMN "awsSecretAccessKey",
ADD COLUMN     "principalId" TEXT,
ADD COLUMN     "principalType" "PrincipalType" DEFAULT 'GROUP';

-- AddForeignKey
ALTER TABLE "AssignmentRequest" ADD CONSTRAINT "AssignmentRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
