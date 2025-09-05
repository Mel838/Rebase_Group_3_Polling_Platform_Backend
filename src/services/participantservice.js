import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class ParticipantService { 
  static async joinSession(name, email, phone, session_code) {
    if (!name || (!email && !phone)) {
      throw new AppError('Name and either email or phone are required', 400);
    }

    // Verify session is active
    const sessionResult = await client(`
      SELECT session_id FROM sessions WHERE session_code = $1 AND status = 'active'`,
      [session_code]
    );

    if (sessionResult.rows.length === 0) {
      throw new AppError('Invalid or inactive session', 404);
    }

    const session_id = sessionResult.rows[0].session_id;

    // Insert participant
    const result = await client(`
      INSERT INTO participants(session_id, name, email, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING participant_id, name, email, phone, joined_at`,
      [session_id, name, email, phone]
    );

    const participant = result.rows[0];

    logger.info(`Participant ${participant.name} joined session ${session_code}`);

    return {
      participant_id: participant.participant_id,
      session_id,
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      joined_at: participant.joined_at
    };
  }
  
  static async getPublishedPolls(session_id) {
    const result = await client(`
      SELECT poll_id, question, options, type, created_at FROM polls 
      WHERE session_id = $1 AND is_published = true
      ORDER BY created_at ASC`,
      [session_id]
    );
    return result.rows;
  }

  static async submitResponse({ poll_id, participant_id, response }) {
    const pollCheck = await client(`
      SELECT poll_id FROM polls WHERE poll_id = $1 AND is_published = true`,
      [poll_id]
    );

    if (pollCheck.rows.length === 0) {
      throw new AppError('Poll not found or not published.', 404);
    }

    const insertResult = await client(
      `INSERT INTO responses (poll_id, participant_id, response)
       VALUES ($1, $2, $3)
       RETURNING response_id, response, submitted_at`,
      [poll_id, participant_id, response]
    );

    const res = insertResult.rows[0];

    logger.info(`Response submitted by participant ${participant_id} for poll ${poll_id}`);

    return {
      response_id: res.response_id,
      response: res.response,
      submitted_at: res.submitted_at
    };
  }
}