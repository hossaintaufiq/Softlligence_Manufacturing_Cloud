import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Sections 1–3 seed — demo tenant admin + platform Super Admin.
 * Passwords come from env only (never shipped in the frontend bundle).
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

  await prisma.user.upsert({
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

  console.log('Seed complete:', {
    tenant: tenant.slug,
    tenantAdmin: 'admin@demo.local',
    platformAdmin: platformEmail,
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
