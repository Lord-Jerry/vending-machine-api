/*
  Warnings:

  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SELLER', 'BUYER');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "deposit" SET DEFAULT 0,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;
