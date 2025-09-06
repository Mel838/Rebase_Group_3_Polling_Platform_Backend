import path from "node:path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import winston from "winston"
import { config } from "../config/env.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logDir = path.join(__dirname, "../logs")

// Ensure logs directory exists
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
    console.log(`Created logs directory: ${logDir}`)
  }
} catch (error) {
  console.error('Failed to create logs directory:', error)
}

const transports = []
const exceptionHandlers = []
const rejectionHandlers = []

// Add file transports only if logs directory exists
if (fs.existsSync(logDir)) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: 'error',
      maxsize: 5242880
    }),
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
      level: "info",
      maxsize: 5242880 
    })
  )

  exceptionHandlers.push(
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log') 
    })
  )

  rejectionHandlers.push(
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log') 
    })
  )
}

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'polling_platform' },
  transports,
  exceptionHandlers,
  rejectionHandlers,
  exitOnError: false
})

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.align(),
      winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    level: "debug"
  }))
}