/*
  Warnings:

  - A unique constraint covering the columns `[principalId]` on the table `AssignmentRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `principalId` to the `AssignmentRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssignmentRequest" ADD COLUMN     "principalDisplayName" TEXT,
ADD COLUMN     "principalId" TEXT NOT NULL,
ADD COLUMN     "principalType" "PrincipalType" NOT NULL DEFAULT 'GROUP';

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentRequest_principalId_key" ON "AssignmentRequest"("principalId");
