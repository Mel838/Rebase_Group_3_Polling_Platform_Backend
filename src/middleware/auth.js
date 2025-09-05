import jwt from 'jsonwebtoken';
import { AppError, catchAsync } from './errorHandler.js';
import { config } from '../config/env.js';
import { client } from '../utils/database.js';
import { logger } from '../utils/logger.js';

// Middleware to protect routes - verify JWT token
export const protect = catchAsync(async (req, res, next) => {
  // 1) Get token from headers or cookies
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to access this resource.', 401));
  }

  // Skip if logout token
  if (token === 'logged-out') {
    return next(new AppError('You are not logged in! Please log in to access this resource.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, config.jwt.secret);

  // 3) Check if host still exists
  const result = await client('SELECT host_id, hostname, host_email FROM hosts WHERE host_id = $1', [decoded.host_id]);
  
  if (result.rows.length === 0) {
    return next(new AppError('The host belonging to this token no longer exists.', 401));
  }

  // 4) Grant access to protected route
  req.host = result.rows[0];
  logger.info(`Host ${req.host.hostname} authenticated successfully`);
  next();
});

// Generate JWT token
export const generateToken = (host_id) => {
  return jwt.sign({ host_id: host_id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};