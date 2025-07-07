-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'VOLUNTEER', 'OTHER');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('REMOTE', 'ON_SITE', 'HYBRID');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "bannerUrl" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bannerUrl" TEXT;

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employmentType" "EmploymentType",
    "companyName" TEXT NOT NULL,
    "currentlyWorking" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "locationType" "LocationType",
    "description" TEXT,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Experience_profileId_idx" ON "Experience"("profileId");

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
