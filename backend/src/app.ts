import express, { Application } from 'express';
import { config } from './config';
import { corsMiddleware } from './middlewares/cors';
import { loggerMiddleware } from './middlewares/logger';
import { rateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFound';
import apiRouter from './routes';
import { dbManager } from './db/db';

export const createApp = (): Application => {
  const app = express();

  // Initialize DB seeds if not existing
  dbManager.init();

  // Global Core Middlewares
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(loggerMiddleware);
  app.use(rateLimiter());

  // Mount Root & API Routes
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Softlligence Manufacturing Cloud Backend API',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/health',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(config.apiPrefix, apiRouter);

  // 404 & Global Error Handling Middlewares
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
