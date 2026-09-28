import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] [${req.method} ${req.url}]:`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(err.details && { details: err.details }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
  });
};
