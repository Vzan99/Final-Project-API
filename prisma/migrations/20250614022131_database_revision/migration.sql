/*
  Warnings:

  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `category` on the `Job` table. All the data in the column will be lost.
  - The `status` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentStatus` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `position` to the `CompanyReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experienceLevel` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "testScore" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "qrCodeUrl" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "CompanyReview" ADD COLUMN     "careerRating" INTEGER,
ADD COLUMN     "cultureRating" INTEGER,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "workLifeRating" INTEGER;

-- AlterTable
ALTER TABLE "InterviewSchedule" ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "category",
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "experienceLevel" TEXT NOT NULL,
ADD COLUMN     "hasTest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRemote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobType" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
DROP COLUMN "status",
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "skills" TEXT[];

-- AlterTable
ALTER TABLE "SkillAssessment" ADD COLUMN     "badgeImage" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passingScore" INTEGER NOT NULL DEFAULT 75,
ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentProof" TEXT,
DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "socialLoginProvider" TEXT;

-- AlterTable
ALTER TABLE "UserAssessment" ADD COLUMN     "answers" JSONB,
ADD COLUMN     "timeTaken" INTEGER;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreSelectionTest" (
    "id" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "PreSelectionTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreSelectionAnswer" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,

    CONSTRAINT "PreSelectionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "PreSelectionTest_jobId_key" ON "PreSelectionTest"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "PreSelectionAnswer_userId_testId_key" ON "PreSelectionAnswer"("userId", "testId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreSelectionTest" ADD CONSTRAINT "PreSelectionTest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreSelectionAnswer" ADD CONSTRAINT "PreSelectionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreSelectionAnswer" ADD CONSTRAINT "PreSelectionAnswer_testId_fkey" FOREIGN KEY ("testId") REFERENCES "PreSelectionTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
