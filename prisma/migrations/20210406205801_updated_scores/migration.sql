/*
  Warnings:

  - Added the required column `formId` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "formId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Score" ADD FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
