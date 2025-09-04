import pkg from 'pg';
import { config } from '../config/env.js';
import { logger } from './logger.js';

const { Pool } = pkg;

// Create connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Generic query function
export const client = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(`Client query executed in ${duration}ms`);
    return res;
  } catch (error) {
    logger.error('Database query error:', error.message);
    throw error;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Drop existing tables if they exist (in correct order due to dependencies)
    await client('DROP VIEW IF EXISTS poll_results CASCADE');
    await client('DROP TABLE IF EXISTS responses CASCADE');
    await client('DROP TABLE IF EXISTS options CASCADE');
    await client('DROP TABLE IF EXISTS questions CASCADE');
    await client('DROP TABLE IF EXISTS polls CASCADE');
    await client('DROP TABLE IF EXISTS participants CASCADE');
    await client('DROP TABLE IF EXISTS hosts CASCADE');
    await client('DROP SEQUENCE IF EXISTS hosts_host_id_seq CASCADE');

    // Create Host table
    await client(`
      CREATE TABLE IF NOT EXISTS hosts (
        host_id SERIAL PRIMARY KEY,
        host_email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        hostname VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Create Participants table
    await client(`
      CREATE TABLE IF NOT EXISTS participants (
        participant_id SERIAL PRIMARY KEY,
        participant_email VARCHAR(255) UNIQUE NOT NULL,
        participant_name VARCHAR(100) UNIQUE
      )
    `);

    // Create poll table
    await client(`
      CREATE TABLE IF NOT EXISTS polls (
        poll_id SERIAL PRIMARY KEY,
        poll_title VARCHAR(50) UNIQUE NOT NULL,
        poll_description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create poll questions table
    await client(`
      CREATE TABLE IF NOT EXISTS questions (
        question_id SERIAL PRIMARY KEY,
        poll_id INTEGER REFERENCES polls(poll_id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL, -- e.g., 'multiple_choice', 'open_ended'
        position INTEGER -- for ordering questions
      )
    `);

    // Create poll options for questions table
    await client(`
      CREATE TABLE IF NOT EXISTS options (
        option_id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        position INTEGER
      )
    `);

    // Create poll responses for participants
    await client(`
      CREATE TABLE IF NOT EXISTS responses (
        response_id SERIAL PRIMARY KEY,
        participant_id INTEGER REFERENCES participants(participant_id),
        question_id INTEGER REFERENCES questions(question_id),
        option_id INTEGER REFERENCES options(option_id), -- NULL for open-ended
        response_text TEXT, -- used for open-ended responses
        responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(participant_id, question_id) -- prevent duplicate votes per question
      )
    `);

    // Create poll results view
    await client(`
      CREATE OR REPLACE VIEW poll_results AS
      SELECT
          q.question_id AS question_id,
          o.option_id AS option_id,
          o.option_text,
          COUNT(r.response_id) AS vote_count
      FROM options o
      JOIN questions q ON o.question_id = q.question_id
      LEFT JOIN responses r ON o.option_id = r.option_id
      GROUP BY q.question_id, o.option_id, o.option_text
    `);

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error.message);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Closing database...');
  pool.end();
});

export default pool;