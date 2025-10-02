import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class SessionService {
  static async createSession(sessionData, host_id) {
    const { title, description } = sessionData;
    
    // Generate unique 6-character session code
    const session_code = Math.random().toString(36).substr(2, 6).toUpperCase();

    const result = await client(`
      INSERT INTO sessions (host_id, title, description, session_code)
      VALUES ($1, $2, $3, $4)
      RETURNING session_id, title, description, session_code, status, created_at`,
      [host_id, title, description, session_code]
    );

    const session = result.rows[0];
    
    logger.info(`Session created: ${session_code} by host ${host_id}`);

    return session;
  }

  static async getHostSessions(host_id) {
    const result = await client(`
      SELECT session_id, title, description, session_code, status, created_at
      FROM sessions WHERE host_id = $1 ORDER BY created_at DESC`,
      [host_id]
    );

    return result.rows;
  }

  static async getSessionById(session_id, host_id) {
    const result = await client(`
      SELECT session_id, title, description, session_code, status, created_at
      FROM sessions WHERE session_id = $1 AND host_id = $2`,
      [session_id, host_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    return result.rows[0];
  }

  static async updateSessionStatus(session_id, host_id, status) {
    const result = await client(`
      UPDATE sessions SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $2 AND host_id = $3
      RETURNING session_id, title, status`,
      [status, session_id, host_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    return result.rows[0];
  }

  static async getSessionParticipants(session_id, host_id) {
  // Verify session belongs to host
  const sessionCheck = await client(
    'SELECT session_id FROM sessions WHERE session_id = $1 AND host_id = $2',
    [session_id, host_id]
  );

  if (sessionCheck.rows.length === 0) {
    throw new AppError('Session not found or access denied', 404);
  }

  // Get participants
  const result = await client(
    `SELECT participant_id, name, email, phone, joined_at 
     FROM participants 
     WHERE session_id = $1 
     ORDER BY joined_at DESC`,
    [session_id]
  );

  return result.rows;
}

}