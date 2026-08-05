-- AlterTable
ALTER TABLE "user_account" ADD COLUMN "is_platform_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "user_account_email_idx" ON "user_account"("email");
