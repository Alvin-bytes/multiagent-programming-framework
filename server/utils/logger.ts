import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure Winston logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'agent-system' },
  transports: [
    // Console transport with custom format
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
        )
      ),
    }),
    // File transport for errors and higher
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    }),
  ],
});

// Add a special logger method for API requests
// Extend winston logger type for TypeScript
interface CustomLogger extends winston.Logger {
  apiRequest: (method: string, url: string, status: number, responseTime: number) => void;
}

(logger as CustomLogger).apiRequest = function(method: string, url: string, status: number, responseTime: number) {
  this.info(`API ${method} ${url} ${status} - ${responseTime}ms`);
};

// Export a stream object for Morgan integration
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};