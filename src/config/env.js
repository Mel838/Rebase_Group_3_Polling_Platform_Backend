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
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD
  },

  logging: {
    level: process.env.LOG_LEVEL || "info"
  }
}