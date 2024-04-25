/*
  Warnings:

  - A unique constraint covering the columns `[instanceArn,permissionSetArn,principalId]` on the table `AccountAssignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccountAssignment_instanceArn_permissionSetArn_principalId_key" ON "AccountAssignment"("instanceArn", "permissionSetArn", "principalId");
