import express from 'express';
import { PollController } from '../controllers/pollcontroller.js';
import { validatePollId } from '../middleware/validation.js';

const router = express.Router();

router.post('/', PollController.createPoll);

router.put('/:poll_id/publish', validatePollId, PollController.publishPoll);

router.put('/:poll_id/close', validatePollId, PollController.closePoll);

router.get('/published/:session_id', PollController.getPublishedPolls);

router.get('/:poll_id/responses', PollController.getPollResponses);

export default router;