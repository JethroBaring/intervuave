/*
  Warnings:

  - You are about to drop the column `finalTranscript` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `transcriptWeb` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `transcriptWhisper` on the `Response` table. All the data in the column will be lost.
  - Added the required column `disfluencies` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emotionTimeline` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expressiveness` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expressivenessTimeline` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gazeTimeline` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gestures` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metricsConfidence` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movement` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pauseLocations` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postureTimeline` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processingVersion` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualityFlag` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `speechFeatures` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transcript` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wordTimings` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `eyeGaze` on the `Response` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `posture` on the `Response` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Response" DROP COLUMN "finalTranscript",
DROP COLUMN "transcriptWeb",
DROP COLUMN "transcriptWhisper",
ADD COLUMN     "disfluencies" JSONB NOT NULL,
ADD COLUMN     "emotionTimeline" JSONB NOT NULL,
ADD COLUMN     "expressiveness" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "expressivenessTimeline" JSONB NOT NULL,
ADD COLUMN     "gazeTimeline" JSONB NOT NULL,
ADD COLUMN     "gestures" INTEGER NOT NULL,
ADD COLUMN     "metricsConfidence" JSONB NOT NULL,
ADD COLUMN     "movement" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pauseLocations" JSONB NOT NULL,
ADD COLUMN     "postureTimeline" JSONB NOT NULL,
ADD COLUMN     "processingVersion" TEXT NOT NULL,
ADD COLUMN     "qualityFlag" TEXT NOT NULL,
ADD COLUMN     "speechFeatures" JSONB NOT NULL,
ADD COLUMN     "transcript" TEXT NOT NULL,
ADD COLUMN     "wordTimings" JSONB NOT NULL,
DROP COLUMN "eyeGaze",
ADD COLUMN     "eyeGaze" DOUBLE PRECISION NOT NULL,
DROP COLUMN "posture",
ADD COLUMN     "posture" DOUBLE PRECISION NOT NULL;
