/*
  Warnings:

  - Added the required column `filedata` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "filedata" BYTEA NOT NULL;
