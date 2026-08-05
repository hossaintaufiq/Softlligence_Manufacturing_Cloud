import { prisma } from '../../config/prisma.js';

export type LogAuditEventParams = {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  payloadJson?: Record<string, any>;
};

/** Section 13 — Append-Only Immutable Audit Trail Logger */
export async function logAuditEvent(params: LogAuditEventParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId || null,
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        payloadJson: params.payloadJson || null,
      },
    });
  } catch (err) {
    console.error('[AUDIT LOG ERROR] Failed to record audit log:', err);
    return null;
  }
}
