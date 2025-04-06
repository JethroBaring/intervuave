/*
  Warnings:

  - A unique constraint covering the columns `[email,companyId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Interview" ALTER COLUMN "interviewLink" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL,
ALTER COLUMN "videoUrl" DROP NOT NULL,
ALTER COLUMN "cameraType" DROP NOT NULL,
ALTER COLUMN "micType" DROP NOT NULL,
ALTER COLUMN "deviceType" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_companyId_key" ON "Candidate"("email", "companyId");
