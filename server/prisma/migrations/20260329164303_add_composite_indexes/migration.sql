-- CreateIndex
CREATE INDEX "properties_status_moderationStatus_rankScore_idx" ON "properties"("status", "moderationStatus", "rankScore");

-- CreateIndex
CREATE INDEX "properties_featured_featuredUntil_idx" ON "properties"("featured", "featuredUntil");
