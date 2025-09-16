import { ParticipantService } from '../services/participantservice.js';
import { catchAsync } from '../middleware/errorHandler.js';

// POST /api/participants/join
export const joinSession = catchAsync(async (req, res) => {
  const { session_code, name, email, phone } = req.body;

  if (!session_code || !name || (!email && !phone)) {
    return res.status(400).json({ 
      success: false,
      message: 'session_code, name, and either email or phone are required.' 
    });
  }

  // Fixed: Pass parameters in correct order (name, email, phone, session_code)
  const participant = await ParticipantService.joinSession(name, email, phone, session_code);
  
  res.status(201).json({
    success: true,
    data: participant
  });
});

// GET /api/participants/:session_id/polls
export const getPublishedPolls = catchAsync(async (req, res) => {
  const { session_id } = req.params;

  const polls = await ParticipantService.getPublishedPolls(session_id);
  
  res.status(200).json({
    success: true,
    data: polls
  });
});

// POST /api/participants/responses
export const submitResponse = catchAsync(async (req, res) => {
  const { poll_id, participant_id, response } = req.body;

  if (!poll_id || !participant_id || response === undefined) {
    return res.status(400).json({ 
      success: false,
      message: 'poll_id, participant_id, and response are required.' 
    });
  }

  const result = await ParticipantService.submitResponse({ poll_id, participant_id, response });
  
  res.status(201).json({
    success: true,
    data: result
  });
});