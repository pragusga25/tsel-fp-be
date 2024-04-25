/*
  Warnings:

  - You are about to drop the column `instanceArn` on the `AccountAssignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[principalId]` on the table `AccountAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AccountAssignment_instanceArn_principalId_key";

-- AlterTable
ALTER TABLE "AccountAssignment" DROP COLUMN "instanceArn";

-- CreateIndex
CREATE UNIQUE INDEX "AccountAssignment_principalId_key" ON "AccountAssignment"("principalId");
