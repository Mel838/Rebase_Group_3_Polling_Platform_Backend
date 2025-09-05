import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: process.env.PORT || 4040,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'polling_db',
    user: process.env.DB_USER || 'mainhost',
    password: process.env.DB_PASSWORD
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Rate limiting configuration
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, 
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100 
  },

  logging: {
    level: process.env.LOG_LEVEL || "info"
  }
}