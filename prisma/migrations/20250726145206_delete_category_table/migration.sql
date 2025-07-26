/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_categoryId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "Category";
