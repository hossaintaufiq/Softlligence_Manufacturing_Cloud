import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './common/logger.js';

const app = createApp();

app.listen(env.port, () => {
  logger.info(`${env.appName} API listening on :${env.port}`, {
    env: env.nodeEnv,
    version: env.appVersion,
  });
});
