import { Server } from 'socket.io';
import { getRedisClient } from './redis.js';


let io;
const activeEditors = new Map(); // Store active editors per clip key

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)[\d.]+:(5173|3000)$/
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔗 Client connected: ${socket.id}`);

    // Join a clip room for real-time updates
    socket.on('join-clip', (data) => {
      const { key, userName } = data;
      if (!key) return;

      socket.join(`clip:${key}`);
      socket.clipKey = key;
      socket.userName = userName || 'Anonymous';

      // Track active editor
      if (!activeEditors.has(key)) {
        activeEditors.set(key, new Set());
      }
      activeEditors.get(key).add({
        socketId: socket.id,
        userName: socket.userName,
        joinedAt: Date.now()
      });

      // Notify others someone joined
      socket.to(`clip:${key}`).emit('user-joined', {
        userName: socket.userName,
        activeCount: activeEditors.get(key).size
      });

      // Send current active users to the new joiner
      socket.emit('active-users', {
        users: Array.from(activeEditors.get(key)),
        count: activeEditors.get(key).size
      });

      console.log(`👤 ${socket.userName} joined clip: ${key}`);
    });

    // Leave clip room
    socket.on('leave-clip', () => {
      if (socket.clipKey) {
        handleUserLeave(socket);
      }
    });

    // Handle content changes
    socket.on('content-change', (data) => {
      const { key, content, timestamp } = data;
      if (socket.clipKey !== key) return;

      // Broadcast to others in the same clip
      socket.to(`clip:${key}`).emit('content-updated', {
        content,
        timestamp,
        userName: socket.userName,
        socketId: socket.id
      });
    });

    // Handle typing indicators
    socket.on('typing-start', () => {
      if (socket.clipKey) {
        socket.to(`clip:${socket.clipKey}`).emit('user-typing', {
          userName: socket.userName,
          socketId: socket.id
        });
      }
    });

    socket.on('typing-stop', () => {
      if (socket.clipKey) {
        socket.to(`clip:${socket.clipKey}`).emit('user-stopped-typing', {
          userName: socket.userName,
          socketId: socket.id
        });
      }
    });

    // Handle cursor position
    socket.on('cursor-position', (data) => {
      const { position } = data;
      if (socket.clipKey) {
        socket.to(`clip:${socket.clipKey}`).emit('cursor-updated', {
          userName: socket.userName,
          socketId: socket.id,
          position
        });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      handleUserLeave(socket);
    });
  });

  const handleUserLeave = (socket) => {
    if (socket.clipKey) {
      const key = socket.clipKey;
      const editors = activeEditors.get(key);
      
      if (editors) {
        // Remove user from active editors
        const userToRemove = Array.from(editors).find(user => user.socketId === socket.id);
        if (userToRemove) {
          editors.delete(userToRemove);
        }

        // Notify others someone left
        socket.to(`clip:${key}`).emit('user-left', {
          userName: socket.userName,
          activeCount: editors.size
        });

        // Clean up if no active editors
        if (editors.size === 0) {
          activeEditors.delete(key);
        }
      }

      socket.leave(`clip:${key}`);
    }
  };

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit clip updates to all connected clients
export const broadcastClipUpdate = (key, updateData) => {
  if (io) {
    io.to(`clip:${key}`).emit('clip-updated', updateData);
  }
};

// Emit file updates
export const broadcastFileUpdate = (key, updateData) => {
  if (io) {
    io.to(`file:${key}`).emit('file-updated', updateData);
  }
};