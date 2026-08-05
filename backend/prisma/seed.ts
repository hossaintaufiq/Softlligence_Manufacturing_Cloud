import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Section 1–2 seed — demo tenant + admin with password from env.
 * Default password is only used server-side in this script (never shipped to the client bundle).
 */
async function main() {
  const demoPassword = process.env.SEED_DEMO_PASSWORD || 'password123';
  const passwordHash = await bcrypt.hash(demoPassword, 12);

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
      passwordHash,
    },
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.local',
      name: 'Demo Admin',
      status: 'active',
      passwordHash,
    },
  });

  console.log('Seed complete:', {
    tenant: tenant.slug,
    user: 'admin@demo.local',
    passwordSource: process.env.SEED_DEMO_PASSWORD ? 'SEED_DEMO_PASSWORD' : 'default',
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
