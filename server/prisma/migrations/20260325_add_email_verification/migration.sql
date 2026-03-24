ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN "verificationTokenExpiry" TIMESTAMP(3);
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");
