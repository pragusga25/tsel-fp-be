/*
  Warnings:

  - You are about to drop the `PrincipalAwsAccountUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrincipalAwsAccountUser" DROP CONSTRAINT "PrincipalAwsAccountUser_userId_fkey";

-- DropTable
DROP TABLE "PrincipalAwsAccountUser";
