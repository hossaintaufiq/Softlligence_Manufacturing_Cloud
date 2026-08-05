import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';

export async function checkDatabase(): Promise<{ ok: boolean; message: string }> {
  if (!env.databaseUrl || env.databaseUrl.includes('USER:PASSWORD')) {
    return { ok: false, message: 'DATABASE_URL not configured' };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: 'connected' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'database unreachable',
    };
  }
}
