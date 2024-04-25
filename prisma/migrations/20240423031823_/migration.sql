/*
  Warnings:

  - You are about to drop the column `aws_access_key` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `aws_secret_key` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `identityProviderId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `instanceArn` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "aws_access_key",
DROP COLUMN "aws_secret_key",
DROP COLUMN "identityProviderId",
DROP COLUMN "instanceArn",
ADD COLUMN     "awsAccessKeyId" TEXT,
ADD COLUMN     "awsSecretAccessKey" TEXT;

-- CreateTable
CREATE TABLE "IdentityInstance" (
    "id" TEXT NOT NULL,
    "instanceArn" TEXT NOT NULL,
    "identityStoreId" TEXT NOT NULL,

    CONSTRAINT "IdentityInstance_pkey" PRIMARY KEY ("id")
);
