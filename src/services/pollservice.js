import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class PollService {
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