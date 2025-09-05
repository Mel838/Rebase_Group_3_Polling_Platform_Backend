import express from 'express';
import {
  joinSession,
  getPublishedPolls,
  submitResponse
} from '../controllers/participantcontroller.js';

const router = express.Router();

// Join a session (no auth)
router.post('/join', joinSession);

// Get published polls in a session
router.get('/:session_id/polls', getPublishedPolls);

// Submit a poll response
router.post('/responses', submitResponse);

export default router;