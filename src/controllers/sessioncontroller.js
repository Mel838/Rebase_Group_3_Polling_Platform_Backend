import { SessionService } from '../services/sessionservice.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

export class SessionController {
  static createSession = catchAsync(async (req, res) => {
    const session = await SessionService.createSession(req.body, req.host.host_id);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: { session }
    });
  });

  // Get host sessions
  static getHostSessions = catchAsync(async (req, res) => {
    const sessions = await SessionService.getHostSessions(req.host.host_id);

    res.status(200).json({
      success: true,
      data: { sessions }
    });
  });

  // Get session by ID
  static getSession = catchAsync(async (req, res) => {
    const session = await SessionService.getSessionById(req.params.session_id, req.host.host_id);

    res.status(200).json({
      success: true,
      data: { session }
    });
  });

  // Update session status
  static updateSessionStatus = catchAsync(async (req, res) => {
    const { status } = req.body;
    const session = await SessionService.updateSessionStatus(
      req.params.session_id, 
      req.host.host_id, 
      status
    );

    // Emit to all clients in this session
    const io = req.app.get('socketio');
    if (io) {
      io.to(`session_${req.params.session_id}`).emit('sessionStatusUpdate', {
        session_id: req.params.session_id,
        status
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session status updated successfully',
      data: { session }
    });
  });
}

export const getHostSessions = SessionService.getHostSessions;
export const getSession = SessionService.getSessionById;
export const updateSessionStatus = SessionService.updateSessionStatus;
export const createSession = SessionController.createSession;