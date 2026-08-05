import dotenv from 'dotenv';
dotenv.config();

import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ensureTenantIamDefaults } from '../src/modules/iam/iam.permissions.js';
import { ensureTenantModuleDefaults } from '../src/modules/modules/modules.service.js';

/**
 * Sections 1–7 seed — platform admin, demo tenant, org, IAM, modules, inventory.
 */
async function main() {
  const prisma = new PrismaClient();

  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'password123';
  const platformPassword = process.env.SEED_PLATFORM_PASSWORD || 'platform123';
  const demoHash = await bcrypt.hash(demoPassword, 12);
  const platformHash = await bcrypt.hash(platformPassword, 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: { name: 'Demo Manufacturing Co', status: 'active' },
    create: {
      slug: 'demo',
      name: 'Demo Manufacturing Co',
      status: 'active',
      planCode: 'trial',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@demo.local',
      },
    },
    update: {
      name: 'Demo Admin',
      status: 'active',
      passwordHash: demoHash,
      isPlatformAdmin: false,
    },
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.local',
      name: 'Demo Admin',
      status: 'active',
      passwordHash: demoHash,
      isPlatformAdmin: false,
    },
  });

  const platformEmail = 'superadmin@softlligence.local';
  const existingPlatform = await prisma.user.findFirst({
    where: { email: platformEmail, tenantId: null },
  });

  if (existingPlatform) {
    await prisma.user.update({
      where: { id: existingPlatform.id },
      data: {
        name: 'Softlligence Super Admin',
        status: 'active',
        passwordHash: platformHash,
        isPlatformAdmin: true,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        tenantId: null,
        email: platformEmail,
        name: 'Softlligence Super Admin',
        status: 'active',
        passwordHash: platformHash,
        isPlatformAdmin: true,
      },
    });
  }

  const company = await prisma.company.upsert({
    where: {
      tenantId_code: {
        tenantId: tenant.id,
        code: 'DEMO',
      },
    },
    update: {
      name: 'Demo Manufacturing Co Ltd',
      status: 'active',
      currency: 'USD',
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      name: 'Demo Manufacturing Co Ltd',
      code: 'DEMO',
      currency: 'USD',
      status: 'active',
    },
  });

  const factory = await prisma.factory.upsert({
    where: {
      tenantId_companyId_code: {
        tenantId: tenant.id,
        companyId: company.id,
        code: 'MAIN',
      },
    },
    update: {
      name: 'Main Plant',
      timezone: 'Asia/Dhaka',
      status: 'active',
      deletedAt: null,
    },
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      name: 'Main Plant',
      code: 'MAIN',
      timezone: 'Asia/Dhaka',
      status: 'active',
    },
  });

  const { adminRoleId } = await ensureTenantIamDefaults(tenant.id);
  await ensureTenantModuleDefaults(tenant.id);

  // --- Modules & Custom Fields Seed (Section 6) ---
  await prisma.customFieldDefinition.upsert({
    where: {
      tenantId_entityType_fieldKey: {
        tenantId: tenant.id,
        entityType: 'item',
        fieldKey: 'heat_number',
      },
    },
    update: { label: 'Heat / Melt Number', dataType: 'string', isRequired: false },
    create: {
      tenantId: tenant.id,
      entityType: 'item',
      fieldKey: 'heat_number',
      label: 'Heat / Melt Number',
      dataType: 'string',
      isRequired: false,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRoleId,
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      roleId: adminRoleId,
    },
  });

  // --- Inventory Core Seed (Section 7) ---
  const uomMt = await prisma.unitOfMeasure.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'MT' } },
    update: { name: 'Metric Ton', symbol: 'MT' },
    create: { tenantId: tenant.id, code: 'MT', name: 'Metric Ton', symbol: 'MT' },
  });

  await prisma.unitOfMeasure.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'PCS' } },
    update: { name: 'Pieces', symbol: 'pcs' },
    create: { tenantId: tenant.id, code: 'PCS', name: 'Pieces', symbol: 'pcs' },
  });

  const whRm = await prisma.warehouse.upsert({
    where: { tenantId_companyId_code: { tenantId: tenant.id, companyId: company.id, code: 'WH-RM' } },
    update: { name: 'Raw Materials Storage Yard', type: 'RM' },
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      factoryId: factory.id,
      code: 'WH-RM',
      name: 'Raw Materials Storage Yard',
      type: 'RM',
    },
  });

  await prisma.warehouse.upsert({
    where: { tenantId_companyId_code: { tenantId: tenant.id, companyId: company.id, code: 'WH-FG' } },
    update: { name: 'Finished Goods Warehouse', type: 'FG' },
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      factoryId: factory.id,
      code: 'WH-FG',
      name: 'Finished Goods Warehouse',
      type: 'FG',
    },
  });

  const itemBillet = await prisma.item.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'RM-BILLET-150' } },
    update: { name: 'Steel Billet 150x150mm (3SP/5SP)' },
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      code: 'RM-BILLET-150',
      name: 'Steel Billet 150x150mm (3SP/5SP)',
      itemType: 'RM',
      uomId: uomMt.id,
      valuationMethod: 'average',
    },
  });

  await prisma.item.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'FG-REBAR-12MM' } },
    update: { name: 'Deformed Bar 12mm 500W (Grade 60)' },
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      code: 'FG-REBAR-12MM',
      name: 'Deformed Bar 12mm 500W (Grade 60)',
      itemType: 'FG',
      uomId: uomMt.id,
      valuationMethod: 'average',
    },
  });

  // Seed initial stock balance in WH-RM
  await prisma.stockBalance.upsert({
    where: {
      warehouseId_itemId: {
        warehouseId: whRm.id,
        itemId: itemBillet.id,
      },
    },
    update: { qtyOnHand: 450.0 },
    create: {
      tenantId: tenant.id,
      warehouseId: whRm.id,
      itemId: itemBillet.id,
      qtyOnHand: 450.0,
    },
  });

  console.log('Seed complete:', {
    tenant: tenant.slug,
    tenantAdmin: 'admin@demo.local',
    platformAdmin: platformEmail,
    company: company.code,
    factory: 'MAIN',
    inventory: 'Warehouses (WH-RM, WH-FG), Items (RM-BILLET-150, FG-REBAR-12MM)',
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
