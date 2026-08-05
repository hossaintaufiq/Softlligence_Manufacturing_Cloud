-- CreateTable
CREATE TABLE "module_catalog" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" VARCHAR(64) NOT NULL DEFAULT 'core',
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "default_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_module" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "module_code" VARCHAR(64) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config_json" JSONB,
    "enabled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_definition" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "entity_type" VARCHAR(64) NOT NULL,
    "field_key" VARCHAR(64) NOT NULL,
    "label" TEXT NOT NULL,
    "data_type" VARCHAR(32) NOT NULL DEFAULT 'string',
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "options_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "custom_field_definition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_catalog_code_key" ON "module_catalog"("code");

-- CreateIndex
CREATE INDEX "tenant_module_tenant_id_idx" ON "tenant_module"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_module_tenant_id_module_code_key" ON "tenant_module"("tenant_id", "module_code");

-- CreateIndex
CREATE INDEX "custom_field_definition_tenant_id_entity_type_idx" ON "custom_field_definition"("tenant_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definition_tenant_id_entity_type_field_key_key" ON "custom_field_definition"("tenant_id", "entity_type", "field_key");

-- AddForeignKey
ALTER TABLE "tenant_module" ADD CONSTRAINT "tenant_module_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_module" ADD CONSTRAINT "tenant_module_module_code_fkey" FOREIGN KEY ("module_code") REFERENCES "module_catalog"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_definition" ADD CONSTRAINT "custom_field_definition_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
