/*
  Warnings:

  - You are about to drop the column `note` on the `FreezeTime` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `FreezeTime` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `FreezeTime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FreezeTime" DROP COLUMN "note",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FreezeTime_name_key" ON "FreezeTime"("name");
