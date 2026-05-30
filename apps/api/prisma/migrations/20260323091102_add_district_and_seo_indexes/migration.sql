/*
  Warnings:

  - Added the required column `district` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add district with default value first
ALTER TABLE "properties" ADD COLUMN "district" TEXT NOT NULL DEFAULT 'Unknown';

-- Update existing rows with proper district based on city
UPDATE "properties" SET "district" = 'Kebagusan' WHERE "city" = 'Jakarta Selatan';
UPDATE "properties" SET "district" = 'Central' WHERE "city" = 'Jakarta';

-- CreateIndex
CREATE INDEX "properties_district_idx" ON "properties"("district");

-- CreateIndex
CREATE INDEX "properties_listingType_propertyType_idx" ON "properties"("listingType", "propertyType");

-- CreateIndex
CREATE INDEX "properties_listingType_propertyType_city_idx" ON "properties"("listingType", "propertyType", "city");

-- CreateIndex
CREATE INDEX "properties_listingType_propertyType_city_district_idx" ON "properties"("listingType", "propertyType", "city", "district");
