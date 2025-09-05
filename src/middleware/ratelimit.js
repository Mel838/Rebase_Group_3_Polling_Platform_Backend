import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Simple in-memory rate limiting
const requests = new Map();

export const createRateLimiter = (app) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - config.rateLimiting.windowMs;

    // Clean old requests
    if (requests.has(key)) {
      const hostRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, hostRequests);
    } else {
      requests.set(key, []);
    }

    const currentRequests = requests.get(key);

    if (currentRequests.length >= config.rateLimiting.maxRequests) {
      logger.warn(`Rate limit exceeded for IP: ${key}`);
      return res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      });
    }

    // Add current request
    currentRequests.push(now);
    requests.set(key, currentRequests);
    next();
  };
};