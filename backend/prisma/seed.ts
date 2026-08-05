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

  const uomKg = await prisma.unitOfMeasure.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'KG' } },
    update: { name: 'Kilogram', symbol: 'kg' },
    create: { tenantId: tenant.id, code: 'KG', name: 'Kilogram', symbol: 'kg' },
  });

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

  const whFg = await prisma.warehouse.upsert({
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

  const itemRebar = await prisma.item.upsert({
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

  // Section 8 — Seed Bill of Materials (BOM)
  let bom = await prisma.bomHeader.findUnique({
    where: { tenantId_parentItemId_version: { tenantId: tenant.id, parentItemId: itemRebar.id, version: 'v1.0' } },
  });
  if (!bom) {
    bom = await prisma.bomHeader.create({
      data: {
        tenantId: tenant.id,
        companyId: company.id,
        parentItemId: itemRebar.id,
        version: 'v1.0',
        lines: {
          create: [
            {
              componentItemId: itemBillet.id,
              qty: 1.05, // 1.05 MT Billet per 1.00 MT Rebar
              uomId: uomMt.id,
              scrapPercent: 5.0,
            },
          ],
        },
      },
    });
  }

  // Section 8 — Seed Work Order
  const wo = await prisma.workOrder.upsert({
    where: { tenantId_companyId_docNo: { tenantId: tenant.id, companyId: company.id, docNo: 'WO-2026-001' } },
    update: { status: 'in_progress', qtyPlanned: 100.0, qtyCompleted: 50.0 },
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      factoryId: factory.id,
      docNo: 'WO-2026-001',
      woType: 'ROLL',
      status: 'in_progress',
      itemId: itemRebar.id,
      qtyPlanned: 100.0,
      qtyCompleted: 50.0,
      bomHeaderId: bom.id,
    },
  });

  // Seed energy log
  await prisma.energyLog.create({
    data: {
      tenantId: tenant.id,
      factoryId: factory.id,
      workOrderId: wo.id,
      utilityType: 'electricity',
      quantity: 12500.0,
      uomCode: 'kWh',
    },
  }).catch(() => {});

  // ==========================================
  // SECTION 9: Commercial Ops Seeding
  // ==========================================
  const suppParty = await prisma.party.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'SUPP-STEEL-01' } },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      code: 'SUPP-STEEL-01',
      name: 'Apex Scrap & Metals Ltd',
      isSupplier: true,
      isCustomer: false,
      paymentTerms: 'NET30',
      status: 'active',
    },
  });

  const custParty = await prisma.party.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'CUST-BUILD-01' } },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      code: 'CUST-BUILD-01',
      name: 'National Builders Corp',
      isCustomer: true,
      isSupplier: false,
      creditLimit: 500000,
      paymentTerms: 'NET45',
      status: 'active',
    },
  });

  // Seed Purchase Order
  const po = await prisma.purchaseOrder.upsert({
    where: { tenantId_companyId_docNo: { tenantId: tenant.id, companyId: company.id, docNo: 'PO-2026-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      partyId: suppParty.id,
      docNo: 'PO-2026-001',
      status: 'completed',
      totalAmount: 45000.0,
      lines: {
        create: [
          {
            itemId: itemBillet.id,
            uomId: uomKg.id,
            qty: 100000,
            unitPrice: 0.45,
            amount: 45000.0,
          },
        ],
      },
    },
  });

  // Seed Goods Receipt (GRN)
  await prisma.grn.upsert({
    where: { tenantId_companyId_docNo: { tenantId: tenant.id, companyId: company.id, docNo: 'GRN-2026-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      warehouseId: whRm.id,
      partyId: suppParty.id,
      purchaseOrderId: po.id,
      docNo: 'GRN-2026-001',
      status: 'confirmed',
      vehicleNo: 'TRK-9901',
      receivedAt: new Date(),
      lines: {
        create: [
          {
            itemId: itemBillet.id,
            uomId: uomKg.id,
            qtyReceived: 100000,
            unitCost: 0.45,
          },
        ],
      },
    },
  });

  // Seed Sales Order
  const so = await prisma.salesOrder.upsert({
    where: { tenantId_companyId_docNo: { tenantId: tenant.id, companyId: company.id, docNo: 'SO-2026-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      partyId: custParty.id,
      docNo: 'SO-2026-001',
      status: 'completed',
      totalAmount: 37500.0,
      lines: {
        create: [
          {
            itemId: itemRebar.id,
            uomId: uomMt.id,
            qty: 50,
            unitPrice: 750.0,
            amount: 37500.0,
          },
        ],
      },
    },
  });

  // Seed Dispatch / Challan
  await prisma.dispatch.upsert({
    where: { tenantId_companyId_docNo: { tenantId: tenant.id, companyId: company.id, docNo: 'CHAL-2026-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      warehouseId: whFg.id,
      partyId: custParty.id,
      salesOrderId: so.id,
      docNo: 'CHAL-2026-001',
      status: 'confirmed',
      vehicleNo: 'TRK-4420',
      freightAmount: 800.0,
      confirmedAt: new Date(),
      lines: {
        create: [
          {
            itemId: itemRebar.id,
            uomId: uomMt.id,
            qty: 50,
            unitPrice: 750.0,
            amount: 37500.0,
          },
        ],
      },
    },
  });

  console.log('Seed complete:', {
    tenant: tenant.slug,
    tenantAdmin: 'admin@demo.local',
    platformAdmin: platformEmail,
    company: company.code,
    factory: 'MAIN',
    inventory: 'Warehouses (WH-RM, WH-FG), Items (RM-BILLET-150, FG-REBAR-12MM)',
    manufacturing: 'BOM (v1.0), Work Order (WO-2026-001 in_progress)',
    commercial: 'Parties (SUPP-STEEL-01, CUST-BUILD-01), PO-2026-001, GRN-2026-001, SO-2026-001, CHAL-2026-001',
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
