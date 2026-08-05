-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "tax_id" TEXT,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "address_json" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factory" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "address_json" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "factory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_tenant_id_idx" ON "company"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_tenant_id_code_key" ON "company"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "factory_tenant_id_company_id_idx" ON "factory"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "factory_tenant_id_company_id_code_key" ON "factory"("tenant_id", "company_id", "code");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory" ADD CONSTRAINT "factory_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factory" ADD CONSTRAINT "factory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
