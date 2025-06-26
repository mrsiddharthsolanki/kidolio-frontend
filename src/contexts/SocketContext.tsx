import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  typingUsers: string[];
  lastSeenMap: Record<string, string>;
  sendMessage: (to: string, content: string) => void;
  sendTyping: (to: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  typingUsers: [],
  lastSeenMap: {},
  sendMessage: () => {},
  sendTyping: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;
    socket.emit('join', userId);
    socket.on('online-users', (users: string[]) => setOnlineUsers(users));
    socket.on('typing', (userId: string, isTyping: boolean) => {
      setTypingUsers(prev => isTyping ? [...new Set([...prev, userId])] : prev.filter(id => id !== userId));
      console.log('[SOCKET] Typing event received:', userId, isTyping);
    });
    socket.on('last-seen', (userId: string, lastSeen: string) => {
      setLastSeenMap(prev => ({ ...prev, [userId]: lastSeen }));
      console.log('[SOCKET] Last seen event received:', userId, lastSeen);
    });
    return () => { socket.disconnect(); };
  }, [userId]);

  const sendMessage = (to: string, content: string, tempId?: string) => {
    socketRef.current?.emit('send-message', { from: userId, to, content, tempId });
  };

  const sendTyping = (to: string, isTyping: boolean) => {
    console.log('[SOCKET] Emitting typing:', { to, from: userId, isTyping });
    socketRef.current?.emit('typing', { to, from: userId, isTyping });
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, typingUsers, lastSeenMap, sendMessage, sendTyping }}>
      {children}
    </SocketContext.Provider>
  );
};
