/*
  Warnings:

  - Added the required column `interviewTemplateId` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "interviewTemplateId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewTemplateId_fkey" FOREIGN KEY ("interviewTemplateId") REFERENCES "InterviewTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
