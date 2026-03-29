-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_agentId_idx" ON "reviews"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_authorId_agentId_key" ON "reviews"("authorId", "agentId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
