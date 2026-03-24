-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "freshnessScore" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "lastBoostedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "qualityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rankScore" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "properties_rankScore_idx" ON "properties"("rankScore");
