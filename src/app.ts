import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './config/database';
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

// Database connection for serverless
let isConnected = false;

const ensureDbConnection = async () => {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
};

// Middleware to ensure DB connection on each request
app.use(async (req: Request, res: Response, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (error) {
    logger.error('Database connection error:', error);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
});

// Routes
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Lead Scoring API',
    timestamp: new Date().toISOString() 
  });
});

// Error handler
app.use(errorHandler);

// Export for Vercel
export default app;