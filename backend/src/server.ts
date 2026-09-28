import { createApp } from './app';
import { config } from './config';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Softlligence Manufacturing Cloud Backend Started`);
  console.log(`📡 Server listening on http://localhost:${config.port}`);
  console.log(`📊 API Health check: http://localhost:${config.port}${config.apiPrefix}/health`);
  console.log(`🛡️ Environment: ${config.env}`);
  console.log(`======================================================\n`);
});

// Handle graceful termination
const gracefulShutdown = (signal: string) => {
  console.log(`\n[Shutdown] Received ${signal}. Closing HTTP server cleanly...`);
  server.close(() => {
    console.log('[Shutdown] HTTP server closed. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
