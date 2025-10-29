import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-scoring',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  maxLeadsPerUpload: parseInt(process.env.MAX_LEADS_PER_UPLOAD || '10000'),
};

if (!config.geminiApiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not set');
}
