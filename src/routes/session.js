import express from 'express';
import { createSession } from '../controllers/sessionController.js';
import { authenticate } from '../middleware/authMiddleware.js'; // Example auth middleware

const router = express.Router();

// POST /api/sessions
router.post('/', authenticate, createSession);

export default router;