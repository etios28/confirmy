/*
  Warnings:

  - Added the required column `note` to the `Scan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Scan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Scan" DROP CONSTRAINT "Scan_siteId_fkey";

-- AlterTable
ALTER TABLE "Scan" ADD COLUMN     "note" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."ScanStatus";

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Website"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
