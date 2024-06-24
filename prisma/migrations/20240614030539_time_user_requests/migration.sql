-- CreateTable
CREATE TABLE "AssignmentUserRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "responderId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "permissionSetArn" TEXT NOT NULL,
    "status" "AssignmentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "principalId" TEXT NOT NULL,
    "principalType" "PrincipalType" NOT NULL DEFAULT 'USER',
    "awsAccountId" TEXT NOT NULL,
    "endAt" TIMESTAMP(3),

    CONSTRAINT "AssignmentUserRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeInHour" (
    "timeInHour" INTEGER NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeInHour_pkey" PRIMARY KEY ("timeInHour")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeInHour_timeInHour_key" ON "TimeInHour"("timeInHour");

-- AddForeignKey
ALTER TABLE "AssignmentUserRequest" ADD CONSTRAINT "AssignmentUserRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentUserRequest" ADD CONSTRAINT "AssignmentUserRequest_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeInHour" ADD CONSTRAINT "TimeInHour_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
