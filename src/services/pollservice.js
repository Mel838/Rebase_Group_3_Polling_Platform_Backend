import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class PollService {
  static async createPoll({ session_id, question, options, type }) {
    if (!session_id || !question || !options || !type) {
      throw new AppError('session_id, question, options, and type are required', 400);
    }

    const result = await client(
      `INSERT INTO polls (session_id, question, options, type, is_published, status, created_at)
       VALUES ($1, $2, $3, $4, false, 'draft', CURRENT_TIMESTAMP)
       RETURNING poll_id, question, options, type, is_published, status, created_at`,
      [session_id, question, options, type]
    );

    return result.rows[0];
  }

  static async publishPoll(poll_id, session_id) {
    const result = await client(
      `UPDATE polls SET is_published = true, status = 'published', updated_at = CURRENT_TIMESTAMP
       WHERE poll_id = $1 AND session_id = $2
       RETURNING poll_id, question, options, type, status, created_at`,
      [poll_id, session_id]
    );
    if (result.rows.length === 0) {
      throw new AppError('Poll not found or invalid session', 404);
    }
    return result.rows[0];
  }

  static async getPollResponses(poll_id) {
  const result = await client(
    `SELECT r.response_id, r.response, r.submitted_at, 
            p.participant_id, p.name as participant_name
     FROM responses r
     JOIN participants p ON r.participant_id = p.participant_id
     WHERE r.poll_id = $1
     ORDER BY r.submitted_at DESC`,
    [poll_id]
  );
  
  return result.rows;
}

  static async closePoll(poll_id, session_id) {
    const result = await client(
      `UPDATE polls SET status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE poll_id = $1 AND session_id = $2
       RETURNING poll_id, status`,
      [poll_id, session_id]
    );
    if (result.rows.length === 0) {
      throw new AppError('Poll not found or invalid session', 404);
    }
    return result.rows[0];
  }

  static async getPublishedPolls(session_id) {
    const result = await client(
      `SELECT poll_id, question, options, type, status, created_at
       FROM polls
       WHERE session_id = $1 AND is_published = true`,
      [session_id]
    );
    return result.rows;
  }
}