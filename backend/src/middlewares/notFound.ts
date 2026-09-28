import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Resource not found at ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
};
