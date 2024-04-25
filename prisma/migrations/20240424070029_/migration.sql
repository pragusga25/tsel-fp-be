/*
  Warnings:

  - You are about to drop the column `permissionSetArns` on the `AccountAssignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccountAssignment" DROP COLUMN "permissionSetArns",
ADD COLUMN     "permissionSets" JSONB[];
