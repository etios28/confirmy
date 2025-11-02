/*
  Warnings:

  - You are about to drop the column `note` on the `Scan` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Website` table. All the data in the column will be lost.
  - You are about to drop the `Site` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[url]` on the table `Website` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Site" DROP CONSTRAINT "Site_userId_fkey";

-- DropIndex
DROP INDEX "public"."Website_userId_url_key";

-- AlterTable
ALTER TABLE "Scan" DROP COLUMN "note";

-- AlterTable
ALTER TABLE "Website" DROP COLUMN "userId";

-- DropTable
DROP TABLE "public"."Site";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."Plan";

-- CreateIndex
CREATE UNIQUE INDEX "Website_url_key" ON "Website"("url");
