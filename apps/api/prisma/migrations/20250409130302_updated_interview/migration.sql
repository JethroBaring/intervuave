/*
  Warnings:

  - You are about to drop the column `cultureFit` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `missionAlignment` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `valuesFit` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `visionAlignment` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `cultureFitWeights` on the `InterviewTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `responseQualityWeights` on the `InterviewTemplate` table. All the data in the column will be lost.
  - Added the required column `aiFeedback` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cultureFitComposite` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `responseQuality` on the `Evaluation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "cultureFit",
DROP COLUMN "missionAlignment",
DROP COLUMN "valuesFit",
DROP COLUMN "visionAlignment",
ADD COLUMN     "aiFeedback" TEXT NOT NULL,
ADD COLUMN     "cultureFitComposite" JSONB NOT NULL,
DROP COLUMN "responseQuality",
ADD COLUMN     "responseQuality" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "InterviewTemplate" DROP COLUMN "cultureFitWeights",
DROP COLUMN "responseQualityWeights",
ADD COLUMN     "cultureFitWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
ADD COLUMN     "responseQualityWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.3;
