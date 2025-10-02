import { PollService } from '../services/pollservice.js';
import { AppError } from '../middleware/errorHandler.js';

export class PollController {
  // Create a new poll
  static async createPoll(req, res, next) {
    try {
      const { session_id, question, options, type } = req.body;

      // Validate required fields
      if (!session_id || !question || !options || !type) {
        throw new AppError('session_id, question, options, and type are required', 400);
      }

      const newPoll = await PollService.createPoll({ session_id, question, options, type });

      res.status(201).json({
        success: true,
        message: 'Poll created successfully',
        data: newPoll
      });
    } catch (error) {
      next(error);
    }
  }

  //Publish a poll
  static async publishPoll(req, res, next) {
    try {
      const { poll_id } = req.params;
      const { session_id } = req.body;

      // Validate required fields
      if (!session_id) {
        throw new AppError('Session ID is required', 400);
      }

      const publishedPoll = await PollService.publishPoll(poll_id, session_id);

      res.status(200).json({
        success: true,
        message: 'Poll published successfully',
        data: publishedPoll
      });
    } catch (error) {
      next(error);
    }
  }

  // Get poll responses
  static async getPollResponses(req, res, next) {
  try {
    const { poll_id } = req.params;
    
    const responses = await PollService.getPollResponses(poll_id);

    res.status(200).json({
      success: true,
      data: responses
    });
  } catch (error) {
    next(error);
  }
}

  // Close a poll
  static async closePoll(req, res, next) {
    try {
      const { poll_id } = req.params;
      const { session_id } = req.body;

      // Validate required fields
      if (!session_id) {
        throw new AppError('Session ID is required', 400);
      }

      const closedPoll = await PollService.closePoll(poll_id, session_id);

      res.status(200).json({
        success: true,
        message: 'Poll closed successfully',
        data: closedPoll
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all published polls for a session
  // GET /api/polls/published/:session_id
  static async getPublishedPolls(req, res, next) {
    try {
      const { session_id } = req.params;

      const publishedPolls = await PollService.getPublishedPolls(session_id);

      res.status(200).json({
        success: true,
        message: 'Published polls retrieved successfully',
        data: publishedPolls,
        count: publishedPolls.length
      });
    } catch (error) {
      next(error);
    }
  }
}