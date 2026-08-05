import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ensureTenantIamDefaults } from '../src/modules/iam/iam.permissions.js';

const prisma = new PrismaClient();

/**
 * Sections 1–5 seed — platform admin, demo tenant, org, IAM defaults.
 */
async function main() {
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

  await prisma.factory.upsert({
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
  const { ensureTenantModuleDefaults } = await import('../src/modules/modules/modules.service.js');
  await ensureTenantModuleDefaults(tenant.id);

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

  console.log('Seed complete:', {
    tenant: tenant.slug,
    tenantAdmin: 'admin@demo.local',
    platformAdmin: platformEmail,
    company: company.code,
    factory: 'MAIN',
    role: 'tenant_admin',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
