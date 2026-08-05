-- CreateSchema
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "plan_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deactivated_at" TIMESTAMP(3),

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "refresh_token_hash" TEXT NOT NULL,
    "client_signature" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "user_account_tenant_id_idx" ON "user_account"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_tenant_id_email_key" ON "user_account"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_refresh_token_hash_key" ON "auth_session"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "auth_session_user_id_idx" ON "auth_session"("user_id");

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
