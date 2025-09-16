import { Server } from 'socket.io';
import { ParticipantService } from '../services/participantservice.js';
import { PollService } from '../services/pollservice.js';
import { logger } from '../utils/logger.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:4000", "https://frontendapp.vercel.app"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Participant joins a session
    socket.on('joinSession', async ({ session_code, name, email, phone }) => {
      try {
        const participant = await ParticipantService.joinSession(name, email, phone, session_code);
        const room = `session_${participant.session_id}`;

        socket.join(room);
        socket.participantId = participant.participant_id;
        socket.sessionId = participant.session_id;

        socket.emit('joinedSession', participant);

        // Send existing published polls
        const polls = await PollService.getPublishedPolls(participant.session_id);
        socket.emit('publishedPolls', polls);

        logger.info(`Participant ${name} joined session ${session_code}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Host publishes a poll
    socket.on('publishPoll', async ({ poll_id, session_id }) => {
      try {
        const poll = await PollService.publishPoll(poll_id, session_id);
        io.to(`session_${session_id}`).emit('newPoll', poll);
        logger.info(`Poll ${poll_id} published to session ${session_id}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Participant submits response
    socket.on('submitResponse', async ({ poll_id, participant_id, response }) => {
      try {
        const result = await ParticipantService.submitResponse({ poll_id, participant_id, response });
        socket.emit('responseSubmitted', result);
        
        // Notify host room about new response
        const sessionId = socket.sessionId;
        socket.to(`host_session_${sessionId}`).emit('newResponse', {
          poll_id,
          participant_id,
          response
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};