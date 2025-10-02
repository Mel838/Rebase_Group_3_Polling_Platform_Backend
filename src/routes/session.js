import express from 'express';
import { SessionController } from '../controllers/sessioncontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// FIXED: Add all missing routes
router.post('/', protect, SessionController.createSession);
router.get('/', protect, SessionController.getHostSessions);
router.get('/:session_id', protect, SessionController.getSession);
router.put('/:session_id/status', protect, SessionController.updateSessionStatus);

// Add participants endpoint for session
router.get('/:session_id/participants', protect, SessionController.getSessionParticipants);

export default router;