import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Foundation seed — minimal demo tenant + user shell.
 * Passwords / full auth come in Section 2.
 */
async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: { name: 'Demo Manufacturing Co' },
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
    update: { name: 'Demo Admin' },
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.local',
      name: 'Demo Admin',
      status: 'active',
      passwordHash: null,
    },
  });

  console.log('Seed complete:', { tenant: tenant.slug, user: 'admin@demo.local' });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
