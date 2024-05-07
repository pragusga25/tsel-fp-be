-- DropForeignKey
ALTER TABLE "AssignmentRequest" DROP CONSTRAINT "AssignmentRequest_responderId_fkey";

-- DropForeignKey
ALTER TABLE "FreezeTime" DROP CONSTRAINT "FreezeTime_creatorId_fkey";

-- AddForeignKey
ALTER TABLE "AssignmentRequest" ADD CONSTRAINT "AssignmentRequest_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreezeTime" ADD CONSTRAINT "FreezeTime_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
