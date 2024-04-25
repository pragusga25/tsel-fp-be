/*
  Warnings:

  - You are about to drop the column `permissionSetArn` on the `AccountAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `permissionSetArn` on the `AssignmentRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[instanceArn,principalId]` on the table `AccountAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AccountAssignment_instanceArn_permissionSetArn_principalId_key";

-- AlterTable
ALTER TABLE "AccountAssignment" DROP COLUMN "permissionSetArn",
ADD COLUMN     "permissionSetArns" TEXT[];

-- AlterTable
ALTER TABLE "AssignmentRequest" DROP COLUMN "permissionSetArn",
ADD COLUMN     "permissionSetArns" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "AccountAssignment_instanceArn_principalId_key" ON "AccountAssignment"("instanceArn", "principalId");
