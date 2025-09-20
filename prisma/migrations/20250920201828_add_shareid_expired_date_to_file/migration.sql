/*
  Warnings:

  - A unique constraint covering the columns `[shareId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "expiredDate" TIMESTAMP(3),
ADD COLUMN     "shareId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_shareId_key" ON "public"."File"("shareId");
