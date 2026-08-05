import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

type RateLimitBucket = {
  count: number;
  resetTime: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function createRateLimiter(options: { maxRequests: number; windowMs: number; name?: string }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const key = `${options.name || 'limiter'}:${ip}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 1, resetTime: now + options.windowMs };
      buckets.set(key, bucket);
      return next();
    }

    if (bucket.count >= options.maxRequests) {
      return next(
        new AppError(
          429,
          `Rate limit exceeded. Maximum ${options.maxRequests} requests per ${options.windowMs / 1000}s allowed.`,
          'RATE_LIMIT_EXCEEDED'
        )
      );
    }

    bucket.count += 1;
    next();
  };
}

export const authRateLimiter = createRateLimiter({
  name: 'auth',
  maxRequests: 10,
  windowMs: 60 * 1000, // 10 auth requests per minute
});

export const apiRateLimiter = createRateLimiter({
  name: 'api',
  maxRequests: 1000,
  windowMs: 60 * 1000, // 1000 requests per minute
});
