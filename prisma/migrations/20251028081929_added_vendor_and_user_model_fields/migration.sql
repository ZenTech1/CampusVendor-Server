/*
  Warnings:

  - Added the required column `password` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "OTP_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_setup" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "OTP" TEXT,
ADD COLUMN     "OTP_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "twoFA" BOOLEAN NOT NULL DEFAULT false;
