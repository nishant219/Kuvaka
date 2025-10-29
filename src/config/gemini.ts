import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './env';

export const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};
