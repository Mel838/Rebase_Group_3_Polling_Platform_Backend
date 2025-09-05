import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class SessionService {
  // Generate unique session code
  static generateSessionCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Create new session
  static async createSession(sessionData, host_id) {
    const { title, description } = sessionData;
    
    // Generate unique session code
    let sessionCode;
    let codeExists = true;
    
    while (codeExists) {
      sessionCode = this.generateSessionCode();
      const existingSession = await client(
        'SELECT session_id FROM sessions WHERE session_code = $1',
        [sessionCode]
      );
      codeExists = existingSession.rows.length > 0;
    }

    // Create session
    const result = await client(
      `INSERT INTO sessions (host_id, title, description, session_code, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING session_id, title, description, session_code, status, created_at`,
      [host_id, title, description, sessionCode, 'active']
    );

    const session = result.rows[0];
    
    logger.info(`Session created: ${session.title} with code ${sessionCode}`);
    
    return {
      session_id: session.session_id,
      title: session.title,
      description: session.description,
      session_code: session.session_code,
      status: session.status,
      created_at: session.created_at
    };
  }

  // Get host sessions
  static async getHostSessions(host_id) {
    const result = await client(
      `SELECT s.session_id, s.title, s.description, s.session_code, s.status, s.created_at,
              COUNT(p.participant_id) as participant_count,
              COUNT(po.poll_id) as poll_count
       FROM sessions s
       LEFT JOIN participants p ON s.session_id = p.session_id
       LEFT JOIN polls po ON s.session_id = po.session_id
       WHERE s.host_id = $1
       GROUP BY s.session_id, s.title, s.description, s.session_code, s.status, s.created_at
       ORDER BY s.created_at DESC`,
      [host_id]
    );

    return result.rows;
  }

  // Get session by ID
  static async getSessionById(session_id, host_id) {
    const result = await client(
      `SELECT s.*, h.hostname 
       FROM sessions s
       JOIN hosts h ON s.host_id = h.host_id
       WHERE s.session_id = $1 AND s.host_id = $2`,
      [session_id, host_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    return result.rows[0];
  }

  // Get session by code (for participants)
  static async getSessionByCode(session_code) {
    const result = await client(
      `SELECT s.session_id, s.title, s.description, s.session_code, s.status, h.hostname
       FROM sessions s
       JOIN hosts h ON s.host_id = h.host_id
       WHERE s.session_code = $1 AND s.status = 'active'`,
      [session_code]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found or inactive', 404);
    }

    return result.rows[0];
  }

  // Update session status
  static async updateSessionStatus(session_id, host_id, status) {
    const result = await client(
      `UPDATE sessions 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE session_id = $2 AND host_id = $3
       RETURNING session_id, status`,
      [status, session_id, host_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Session not found', 404);
    }

    return result.rows[0];
  }

  // Get session participants
  static async getSessionParticipants(session_id, host_id) {
    // Verify session belongs to host
    await this.getSessionById(session_id, host_id);

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