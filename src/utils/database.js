import pkg from 'pg';
import { config } from '../config/env.js';
import { logger } from './logger.js';

const { Pool } = pkg;

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
});

// Database client function
export const client = async (query, params = []) => {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
};

// Initialize database tables - SIMPLIFIED VERSION
export const initializeDatabase = async () => {
  try {
    logger.info('Starting database initialization...');

    // Drop tables in correct order (child tables first)
    await client('DROP TABLE IF EXISTS responses CASCADE');
    await client('DROP TABLE IF EXISTS participants CASCADE');
    await client('DROP TABLE IF EXISTS polls CASCADE');
    await client('DROP TABLE IF EXISTS sessions CASCADE');
    await client('DROP TABLE IF EXISTS hosts CASCADE');

    // Create hosts table
    await client(`
      CREATE TABLE hosts (
        host_id SERIAL PRIMARY KEY,
        host_email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        hostname VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Create sessions table
    await client(`
      CREATE TABLE sessions (
        session_id SERIAL PRIMARY KEY,
        host_id INTEGER REFERENCES hosts(host_id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        session_code VARCHAR(6) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create participants table
    await client(`
      CREATE TABLE participants (
        participant_id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(session_id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create polls table 
    await client(`
      CREATE TABLE polls (
        poll_id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(session_id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB DEFAULT '[]',
        type VARCHAR(50) DEFAULT 'multiple_choice',
        is_published BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create responses table 
    await client(`
      CREATE TABLE responses (
        response_id SERIAL PRIMARY KEY,
        poll_id INTEGER REFERENCES polls(poll_id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES participants(participant_id) ON DELETE CASCADE,
        response JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(participant_id, poll_id)
      )
    `);

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Closing database...');
  pool.end();
});

export default pool;