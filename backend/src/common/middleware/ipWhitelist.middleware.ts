import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

/** Section 13 — Tenant IP CIDR Whitelisting Middleware */
export function checkTenantIpWhitelist(req: Request, _res: Response, next: NextFunction) {
  try {
    const tenant = req.auth?.tenant;
    if (!tenant) return next();

    // Check if tenant has allowed CIDRs set
    const allowedCidrs = (tenant as any).allowedCidrsJson as string[] | undefined;
    if (!allowedCidrs || !Array.isArray(allowedCidrs) || allowedCidrs.length === 0) {
      return next(); // No IP whitelist restriction configured
    }

    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const isAllowed = allowedCidrs.some((cidr) => {
      if (cidr === '*' || cidr === clientIp) return true;
      if (cidr.startsWith('127.') || cidr === '::1' || cidr === 'localhost') return true;
      return false;
    });

    if (!isAllowed) {
      return next(new AppError(403, `Access denied from IP address ${clientIp} for tenant ${tenant.slug}`, 'IP_FORBIDDEN'));
    }

    next();
  } catch (err) {
    next(err);
  }
}
