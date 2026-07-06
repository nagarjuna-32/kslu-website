const socketIo = require('socket.io');
const logger = require('../utils/logger');

let io;
const userSockets = new Map(); // Maps userId -> socketId

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket client connected: ${socket.id}`);

    // User joins a room named after their userId
    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId.toString(), socket.id);
        socket.join(userId.toString());
        logger.debug(`Socket registered user ${userId} to socket ID: ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          logger.debug(`Socket unregistered user ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

const sendRealtimeNotification = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit('notification', notification);
    logger.debug(`Socket notification sent to user room: ${userId}`);
  }
};

module.exports = {
  initSocket,
  getIo,
  sendRealtimeNotification
};
