/*
  Warnings:

  - A unique constraint covering the columns `[shareId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_shareId_key" ON "public"."Folder"("shareId");
