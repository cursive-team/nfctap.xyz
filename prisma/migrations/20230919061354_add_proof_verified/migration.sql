/*
  Warnings:

  - Added the required column `verified` to the `ProofLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProofLog" ADD COLUMN     "verified" BOOLEAN NOT NULL;
