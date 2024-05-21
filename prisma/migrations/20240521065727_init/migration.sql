-- CreateEnum
CREATE TYPE "FreezeTimeTarget" AS ENUM ('USER', 'GROUP', 'ALL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PrincipalType" AS ENUM ('USER', 'GROUP');

-- CreateEnum
CREATE TYPE "AssignmentRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AssignmentOperation" AS ENUM ('ATTACH', 'DETACH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrincipalAwsAccountUser" (
    "id" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "principalType" "PrincipalType" NOT NULL DEFAULT 'GROUP',
    "awsAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrincipalAwsAccountUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentityInstance" (
    "id" TEXT NOT NULL,
    "instanceArn" TEXT NOT NULL,
    "identityStoreId" TEXT NOT NULL,

    CONSTRAINT "IdentityInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountAssignment" (
    "id" TEXT NOT NULL,
    "permissionSetArns" TEXT[],
    "principalId" TEXT NOT NULL,
    "principalType" "PrincipalType" NOT NULL DEFAULT 'GROUP',
    "awsAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastPushedAt" TIMESTAMP(3),

    CONSTRAINT "AccountAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "responderId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "permissionSetArns" TEXT[],
    "status" "AssignmentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "operation" "AssignmentOperation" NOT NULL DEFAULT 'ATTACH',
    "principalId" TEXT NOT NULL,
    "principalType" "PrincipalType" NOT NULL DEFAULT 'GROUP',
    "awsAccountId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "AssignmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreezeTime" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "target" "FreezeTimeTarget" NOT NULL DEFAULT 'ALL',
    "permissionSetArns" TEXT[],
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreezeTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "PrincipalAwsAccountUser_principalId_awsAccountId_principalT_key" ON "PrincipalAwsAccountUser"("principalId", "awsAccountId", "principalType", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountAssignment_principalId_awsAccountId_principalType_key" ON "AccountAssignment"("principalId", "awsAccountId", "principalType");

-- AddForeignKey
ALTER TABLE "PrincipalAwsAccountUser" ADD CONSTRAINT "PrincipalAwsAccountUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentRequest" ADD CONSTRAINT "AssignmentRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentRequest" ADD CONSTRAINT "AssignmentRequest_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreezeTime" ADD CONSTRAINT "FreezeTime_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
