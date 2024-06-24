/*
  Warnings:

  - Added the required column `timeInHour` to the `AssignmentUserRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssignmentUserRequest" ADD COLUMN     "timeInHour" INTEGER NOT NULL;
