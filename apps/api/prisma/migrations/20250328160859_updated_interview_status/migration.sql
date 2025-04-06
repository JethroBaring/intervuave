/*
  Warnings:

  - The values [COMPLETED] on the enum `InterviewStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InterviewStatus_new" AS ENUM ('DRAFT', 'PENDING', 'IN_PROGRESS', 'SUBMITTED', 'PROCESSING', 'EVALUATED', 'EXPIRED');
ALTER TABLE "Interview" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Interview" ALTER COLUMN "status" TYPE "InterviewStatus_new" USING ("status"::text::"InterviewStatus_new");
ALTER TYPE "InterviewStatus" RENAME TO "InterviewStatus_old";
ALTER TYPE "InterviewStatus_new" RENAME TO "InterviewStatus";
DROP TYPE "InterviewStatus_old";
ALTER TABLE "Interview" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
