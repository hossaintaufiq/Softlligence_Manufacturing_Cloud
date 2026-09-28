import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, User, UserRole } from '../types';
import { config } from '../config';
import { dbManager } from '../db/db';

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token missing or invalid format. Expected "Bearer <token>".',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; role: UserRole };
    const db = dbManager.read();
    const user = db.users.find(u => u.id === decoded.userId || u.email === decoded.email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authenticated user no longer exists.',
      });
    }

    req.user = user;
    if (user.tenantId) {
      req.tenantId = user.tenantId;
    }
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired. Please login again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
};

// Optional Auth (passes through even if no token, but sets req.user if valid token provided)
export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; role: UserRole };
    const db = dbManager.read();
    const user = db.users.find(u => u.id === decoded.userId || u.email === decoded.email);
    if (user) {
      req.user = user;
      if (user.tenantId) req.tenantId = user.tenantId;
    }
  } catch {
    // Ignore error for optional auth
  }
  next();
};

// Role Guard Middleware
export const requireRoles = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Requires one of roles: [${roles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

export const requireSuperAdmin = requireRoles(['super-admin']);
export const requireTenantAdmin = requireRoles(['super-admin', 'tenant-admin']);
