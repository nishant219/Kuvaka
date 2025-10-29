import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './config/database';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Start server (only in non-serverless environments)
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  startServer();
} else {
  // Initialize database connection for serverless
  connectDatabase().catch((error) => {
    logger.error('Failed to connect to database:', error);
  });
}

export default app;
