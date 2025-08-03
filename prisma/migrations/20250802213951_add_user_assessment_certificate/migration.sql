/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Certificate` table. All the data in the column will be lost.
  - Made the column `qrCodeUrl` on table `Certificate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `answers` on table `UserAssessment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "expiresAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "issuedAt" DROP NOT NULL,
ALTER COLUMN "issuedAt" DROP DEFAULT,
ALTER COLUMN "qrCodeUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserAssessment" ALTER COLUMN "answers" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_id_fkey" FOREIGN KEY ("id") REFERENCES "UserAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
