import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'secret-key';
const jwtExpire = process.env.JWT_EXPIRE || '7d';

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-scoring',
  jwtSecret: jwtSecret,
  jwtExpire: jwtExpire,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  maxLeadsPerUpload: parseInt(process.env.MAX_LEADS_PER_UPLOAD || '10000'),
};

if (!config.geminiApiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not set');
}

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set, using default value');
}