import winston from 'winston';
import { config } from '../config/config';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'translation-automation' },
  transports: [
    new winston.transports.File({ filename: config.logFilePath }),
    new winston.transports.Console(),
  ],
});