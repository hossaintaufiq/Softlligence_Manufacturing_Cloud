import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}
