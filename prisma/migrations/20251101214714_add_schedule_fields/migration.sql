-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'PRO', 'BUSINESS');

-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "lastScannedAt" TIMESTAMP(3),
ADD COLUMN     "nextScanAt" TIMESTAMP(3),
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'STARTER';
