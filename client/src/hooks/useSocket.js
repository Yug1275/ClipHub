import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, isLocal } from '../utils/api';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(new Map());

  useEffect(() => {
    if (isLocal) {
      // Don't connect socket in standalone/local mode
      setIsConnected(false);
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'], // Force WebSocket for Railway
      withCredentials: true
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔗 Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
      setActiveUsers([]);
      setTypingUsers(new Set());
    });

    socket.on('user-joined', (data) => {
      console.log('👤 User joined:', data.userName);
    });

    socket.on('user-left', (data) => {
      console.log('👋 User left:', data.userName);
    });

    socket.on('active-users', (data) => {
      setActiveUsers(data.users || []);
    });

    socket.on('user-typing', (data) => {
      setTypingUsers(prev => new Set([...prev, data.socketId]));
      
      // Setup auto-clear timeout for this user
      const existingTimeout = typingTimeoutRef.current.get(data.socketId);
      if (existingTimeout) clearTimeout(existingTimeout);
      
      const newTimeout = setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.socketId);
          return newSet;
        });
        typingTimeoutRef.current.delete(data.socketId);
      }, 4000);
      
      typingTimeoutRef.current.set(data.socketId, newTimeout);
    });

    socket.on('user-stopped-typing', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.socketId);
        return newSet;
      });
      
      const existingTimeout = typingTimeoutRef.current.get(data.socketId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        typingTimeoutRef.current.delete(data.socketId);
      }
    });

    return () => {
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinClip = (key, userName = 'Anonymous') => {
    if (socketRef.current && key) {
      socketRef.current.emit('join-clip', { key, userName });
    }
  };

  const leaveClip = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-clip');
    }
  };

  const emitContentChange = (key, content) => {
    if (socketRef.current && key) {
      socketRef.current.emit('content-change', {
        key,
        content,
        timestamp: Date.now()
      });
    }
  };

  const emitTypingStart = (key) => {
    if (socketRef.current && key) {
      socketRef.current.emit('typing-start', { key });
    }
  };

  const emitTypingStop = (key) => {
    if (socketRef.current && key) {
      socketRef.current.emit('typing-stop', { key });
    }
  };

  const onContentUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('content-updated', callback);
      return () => socketRef.current.off('content-updated', callback);
    }
  };

  const onClipUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('clip-updated', callback);
      return () => socketRef.current.off('clip-updated', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    activeUsers,
    typingUsers,
    joinClip,
    leaveClip,
    emitContentChange,
    emitTypingStart,
    emitTypingStop,
    onContentUpdate,
    onClipUpdate
  };
};