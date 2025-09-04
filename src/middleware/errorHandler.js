import { logger } from "../utils/logger.js"

export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.status = `${statusCode}`.startsWith("4") ? 'fail' : 'error'

    Error.captureStackTrace(this, this.constructor)
  }

  const = errorHandler = (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    // just log the error

    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
      error: err.stack,
      // userId: req.user?.id,
      ip: req.ip
    })

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
  }
}