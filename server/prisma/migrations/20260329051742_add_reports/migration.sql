-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_propertyId_idx" ON "reports"("propertyId");

-- CreateIndex
CREATE INDEX "reports_resolved_idx" ON "reports"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "reports_userId_propertyId_key" ON "reports"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
