import { ParticipantService } from '../services/ParticipantService.js';
import { asyncHandler } from '../middleware/asyncHandler.js'; // wrapper to handle async errors

// POST /api/participants/join
export const joinSession = asyncHandler(async (req, res) => {
  const { session_code, name, email, phone } = req.body;

  if (!session_code || !name || (!email && !phone)) {
    return res.status(400).json({ message: 'session_code, name, and either email or phone are required.' });
  }

  const participant = await ParticipantService.joinSession({ session_code, name, email, phone });
  res.status(201).json(participant);
});

// GET /api/participants/:session_id/polls
export const getPublishedPolls = asyncHandler(async (req, res) => {
  const { session_id } = req.params;

  const polls = await ParticipantService.getPublishedPolls(session_id);
  res.json(polls);
});

// POST /api/participants/responses
export const submitResponse = asyncHandler(async (req, res) => {
  const { poll_id, participant_id, response } = req.body;

  if (!poll_id || !participant_id || response === undefined) {
    return res.status(400).json({ message: 'poll_id, participant_id, and response are required.' });
  }

  const result = await ParticipantService.submitResponse({ poll_id, participant_id, response });
  res.status(201).json(result);
});