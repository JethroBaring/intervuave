/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `evaluates` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "videoUrl",
ADD COLUMN     "filename" TEXT;

-- AlterTable
ALTER TABLE "InterviewTemplate" ADD COLUMN     "cultureFitWeights" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
ADD COLUMN     "responseQualityWeights" DOUBLE PRECISION NOT NULL DEFAULT 0.3;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "evaluates";
