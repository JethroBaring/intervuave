/*
  Warnings:

  - You are about to drop the column `coreValueId` on the `Question` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_coreValueId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "coreValueId";

-- CreateTable
CREATE TABLE "_CoreValueToQuestion" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoreValueToQuestion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CoreValueToQuestion_B_index" ON "_CoreValueToQuestion"("B");

-- AddForeignKey
ALTER TABLE "_CoreValueToQuestion" ADD CONSTRAINT "_CoreValueToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "CoreValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoreValueToQuestion" ADD CONSTRAINT "_CoreValueToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
