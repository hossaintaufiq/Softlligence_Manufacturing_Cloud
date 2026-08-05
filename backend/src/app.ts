import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestId } from './common/middleware/requestId.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import { notFoundHandler } from './common/middleware/notFoundHandler.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestId);

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
