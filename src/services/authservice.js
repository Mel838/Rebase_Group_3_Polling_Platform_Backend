import bcrypt from 'bcryptjs';
import { client } from '../utils/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  // Register a new host
  static async register(hostData) {
    // This will cause the error if hostData is undefined
const { hostname, host_email, password } = hostData;

    // Hash password with cost factor of 12 for security
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert host into database
    const result = await client(
      'INSERT INTO hosts (hostname, host_email, password_hash) VALUES ($1, $2, $3) RETURNING host_id, hostname, host_email, created_at',
      [hostname, host_email, passwordHash]
    );

    const host = result.rows[0];
    
    // Generate JWT token
    const token = generateToken(host.host_id);

    logger.info(`Host registered successfully: ${hostname}`);

    return {
      host: {
        host_id: host.host_id,
        hostname: host.hostname,
        host_email: host.host_email,
        createdAt: host.created_at
      },
      token
    };
  }

  // Login host
  static async login(credentials) {
    const { host_email, password } = credentials;

    // Find host by email
    const result = await client(
      'SELECT host_id, hostname, host_email, password_hash FROM hosts WHERE host_email = $1',
      [host_email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const host = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, host.password_hash);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = generateToken(host.host_id);

    logger.info(`Host logged in successfully: ${host.hostname}`);

    return {
      host: {
        host_id: host.host_id,
        hostname: host.hostname,
        host_email: host.host_email
      },
      token
    };
  }

  // Get host profile
  static async getSession(host_id) {
    const result = await client(
      'SELECT host_id, hostname, host_email, created_at FROM hosts WHERE host_id = $1',
      [host_id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Host not found', 404);
    }

    return result.rows[0];
  }
}