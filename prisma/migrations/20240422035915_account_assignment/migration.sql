-- CreateEnum
CREATE TYPE "PrincipalType" AS ENUM ('USER', 'GROUP');

-- CreateTable
CREATE TABLE "AccountAssignment" (
    "id" TEXT NOT NULL,
    "instanceArn" TEXT NOT NULL,
    "permissionSetArn" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "principalType" "PrincipalType" NOT NULL DEFAULT 'GROUP',

    CONSTRAINT "AccountAssignment_pkey" PRIMARY KEY ("id")
);
