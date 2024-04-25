-- CreateTable
CREATE TABLE "AccountAssignmentSnapshot" (
    "id" TEXT NOT NULL,
    "permissionSets" JSONB[],
    "principalId" TEXT NOT NULL,
    "principalType" "PrincipalType" NOT NULL DEFAULT 'GROUP',
    "principalDisplayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountAssignmentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreezeTime" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "creatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreezeTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountAssignmentSnapshot_principalId_key" ON "AccountAssignmentSnapshot"("principalId");

-- AddForeignKey
ALTER TABLE "FreezeTime" ADD CONSTRAINT "FreezeTime_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
