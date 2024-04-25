/*
  Warnings:

  - Added the required column `permissionSetArn` to the `AssignmentRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `principalId` to the `AssignmentRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssignmentRequest" ADD COLUMN     "note" TEXT,
ADD COLUMN     "permissionSetArn" TEXT NOT NULL,
ADD COLUMN     "principalId" TEXT NOT NULL,
ADD COLUMN     "principalType" "PrincipalType" NOT NULL DEFAULT 'GROUP';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aws_access_key" TEXT,
ADD COLUMN     "aws_secret_key" TEXT,
ADD COLUMN     "identityProviderId" TEXT,
ADD COLUMN     "instanceArn" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
