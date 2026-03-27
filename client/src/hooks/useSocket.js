import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
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
    });

    socket.on('user-stopped-typing', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.socketId);
        return newSet;
      });
    });

    // Cleanup typing indicators after timeout
    const cleanupTyping = setInterval(() => {
      setTypingUsers(prev => {
        if (prev.size > 0) {
          return new Set(); // Clear all typing indicators periodically
        }
        return prev;
      });
    }, 3000);

    return () => {
      clearInterval(cleanupTyping);
      socket.disconnect();
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

  const emitTypingStart = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing-start');
    }
  };

  const emitTypingStop = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing-stop');
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