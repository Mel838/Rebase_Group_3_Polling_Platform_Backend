import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

// Import routes
import indexRouter from './routes/index.js';
import authRouter from './routes/auth.js';
import sessionRouter from './routes/session.js';
import participantRouter from './routes/participant.js';
import pollsRouter from './routes/polls.js';

// Import middleware and utilities
import { errorHandler } from './middleware/errorHandler.js';
import { createRateLimiter } from './middleware/ratelimit.js';
import { logger } from './utils/logger.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "https://frontendapp.vercel.app"],
  credentials: true
}));

// General middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/session', sessionRouter);
app.use('/api/participants', participantRouter);
app.use('/api/polls', pollsRouter);

// Global error handling middleware
app.use(errorHandler);

export default app;