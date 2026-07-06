/*
  Warnings:

  - You are about to drop the column `image` on the `Gear` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gear" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "Rental" ALTER COLUMN "status" SET DEFAULT 'PLACED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePhoto" TEXT;
