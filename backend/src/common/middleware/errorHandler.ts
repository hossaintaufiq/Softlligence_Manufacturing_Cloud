import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
    });
  }

  logger.error('Unhandled error', {
    requestId,
    err: err instanceof Error ? err.message : String(err),
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      requestId,
    },
  });
}
