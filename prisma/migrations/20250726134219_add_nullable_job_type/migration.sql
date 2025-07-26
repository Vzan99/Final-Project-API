-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('FRONTEND_DEVELOPER', 'BACKEND_DEVELOPER', 'FULL_STACK_DEVELOPER', 'MOBILE_APP_DEVELOPER', 'DEVOPS_ENGINEER', 'GAME_DEVELOPER', 'SOFTWARE_ENGINEER', 'DATA_ENGINEER', 'SECURITY_ENGINEER', 'OTHER');

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewSchedule" DROP CONSTRAINT "InterviewSchedule_jobId_fkey";

-- DropForeignKey
ALTER TABLE "PreSelectionAnswer" DROP CONSTRAINT "PreSelectionAnswer_testId_fkey";

-- DropForeignKey
ALTER TABLE "PreSelectionTest" DROP CONSTRAINT "PreSelectionTest_jobId_fkey";

-- DropForeignKey
ALTER TABLE "SavedJob" DROP CONSTRAINT "SavedJob_jobId_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "jobCategory" "JobCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "jobType" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSchedule" ADD CONSTRAINT "InterviewSchedule_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreSelectionTest" ADD CONSTRAINT "PreSelectionTest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreSelectionAnswer" ADD CONSTRAINT "PreSelectionAnswer_testId_fkey" FOREIGN KEY ("testId") REFERENCES "PreSelectionTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
