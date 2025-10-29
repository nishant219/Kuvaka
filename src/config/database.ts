import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

// Cache the database connection
let cachedConnection: typeof mongoose | null = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  // Return cached connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    // Set mongoose options for serverless
    mongoose.set('strictQuery', false);
    
    const connection = await mongoose.connect(config.mongoUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    logger.info('MongoDB connected successfully');
    
    return connection;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  cachedConnection = null;
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
  cachedConnection = null;
});
