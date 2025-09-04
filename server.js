import app from './src/app.js';
import { config } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import { initializeDatabase } from './src/utils/database.js';

const port = config.port;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Shutting down...', err);
  process.exit(1);
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    const server = app.listen(port, () => {
      logger.info(`Polling Platform running on port ${port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection! Shutting down...', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated!');
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();