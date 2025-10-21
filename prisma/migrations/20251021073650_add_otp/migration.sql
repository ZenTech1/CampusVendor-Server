/*
  Warnings:

  - Added the required column `OTP` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "OTP" TEXT NOT NULL;
