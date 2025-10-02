import { AuthService } from '../services/authservice.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  // Register new host
  static register = catchAsync(async (req, res) => {
  const result = await AuthService.register(req.body);
    
  // Set HTTP-only cookie for additional security (optional)
  res.cookie('jwt', result.token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  res.status(201).json({
      success: true,
      message: 'Host registered successfully',
      data: {
        host: result.host,
        token: result.token
      }
    });
  });

  // Login host
  static login = catchAsync(async (req, res) => {
    const result = await AuthService.login(req.body);

    // Set HTTP-only cookie
    res.cookie('jwt', result.token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      success: true,
      message: 'Host logged in successfully',
      data: {
        host: result.host,
        token: result.token
      }
    });
  });

  // Get host session
  static getSession = catchAsync(async (req, res) => {
    const host = await AuthService.getSession(req.hostUser.host_id);

    res.status(200).json({
      success: true,
      data: {
        host
      }
    });
  });

  // Logout user
  static logout = (req, res) => {
    res.cookie('jwt', 'logged-out', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    logger.info(`User logged out: ${req.host?.hostname || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  };
}