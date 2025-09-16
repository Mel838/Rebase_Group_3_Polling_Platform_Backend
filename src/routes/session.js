import express from 'express';
import { createSession } from '../controllers/sessioncontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/sessions
router.post('/', protect, createSession);

export default router;