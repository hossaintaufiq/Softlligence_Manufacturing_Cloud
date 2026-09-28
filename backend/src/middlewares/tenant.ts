import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { dbManager } from '../db/db';

export const tenantMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Extract tenant from header 'x-tenant-id', query 'tenant', or authenticated user
  const headerTenant = req.headers['x-tenant-id'] as string | undefined;
  const queryTenant = req.query.tenant as string | undefined;
  const userTenant = req.user?.tenantId;

  const tenantSlug = headerTenant || queryTenant || userTenant;

  if (tenantSlug) {
    const db = dbManager.read();
    const tenant = db.tenants.find(t => t.id === tenantSlug || t.slug === tenantSlug);

    if (tenant) {
      if (tenant.status === 'suspended') {
        return res.status(403).json({
          success: false,
          error: `Tenant account '${tenant.name}' is currently suspended. Please contact system administrator.`,
        });
      }
      req.tenantId = tenant.id;
    } else {
      // If user provided a specific non-existent tenant
      req.tenantId = tenantSlug;
    }
  }

  next();
};

export const requireTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.tenantId && (!req.user || req.user.role !== 'super-admin')) {
    return res.status(400).json({
      success: false,
      error: 'Missing required tenant identifier. Pass "x-tenant-id" header or authenticate as tenant user.',
    });
  }
  next();
};
