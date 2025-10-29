import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`📊 API endpoints at http://localhost:${PORT}/api`);
});
