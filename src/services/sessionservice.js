import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { ParticipantService } from './services/ParticipantService.js';
import { PollService } from './services/pollservice.js'; // you’d add this
import { logger } from './utils/logger.js';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', credentials: true }
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Participant joins a session (room)
  socket.on('joinSession', async ({ session_code, name, email, phone }) => {
    try {
      const participant = await ParticipantService.joinSession({ session_code, name, email, phone });
      const session = await ParticipantService.getSessionByCode(session_code); 
      const room = `session:${session.session_id}`;

      socket.join(room);
      socket.emit('joinedSession', { participant, session_id: session.session_id });

      // Send any currently published polls
      const polls = await PollService.getPublishedPolls(session.session_id);
      socket.emit('publishedPolls', polls);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Host publishes a poll
  socket.on('publishPoll', async ({ poll_id, session_id }) => {
    try {
      const poll = await PollService.publishPoll(poll_id, session_id);
      io.to(`session:${session_id}`).emit('newPoll', poll);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Participant submits a response
  socket.on('submitResponse', async ({ poll_id, participant_id, response }) => {
    try {
      const resObj = await ParticipantService.submitResponse({ poll_id, participant_id, response });
      socket.emit('responseSubmitted', resObj);
      // Optionally notify host
      io.to(`hostsession:${socket.id}`).emit('participantResponse', { poll_id, participant_id, response });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Host closes a poll
  socket.on('closePoll', async ({ poll_id, session_id }) => {
    try {
      const poll = await PollService.closePoll(poll_id, session_id);
      io.to(`session:${session_id}`).emit('pollClosed', { poll_id });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});