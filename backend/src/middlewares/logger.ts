import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  res.setHeader('X-Request-Id', requestId as string);

  // Once response finishes, log details
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = ((seconds * 1000) + (nanoseconds / 1000000)).toFixed(2);
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const tenantId = req.headers['x-tenant-id'] || 'system';

    const timestamp = new Date().toISOString();
    const statusColor = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : statusCode >= 300 ? '\x1b[36m' : '\x1b[32m';
    const resetColor = '\x1b[0m';

    console.log(
      `[${timestamp}] [${requestId}] [Tenant: ${tenantId}] ${method} ${url} ${statusColor}${statusCode}${resetColor} - ${durationMs}ms`
    );
  });

  next();
};
