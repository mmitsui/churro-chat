import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Message, 
  UserSession, 
  Room, 
  JoinRoomResponse,
  ServerToClientEvents,
  ClientToServerEvents
} from '../types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketReturn {
  isConnected: boolean;
  isJoined: boolean;
  room: Room | null;
  session: UserSession | null;
  messages: Message[];
  error: string | null;
  joinRoom: (roomId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
  updateNickname: (nickname: string) => Promise<{ success: boolean; error?: string }>;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create socket connection
    const socket: TypedSocket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Connection failed. Please try again.');
    });

    // Room events
    socket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user:joined', (user) => {
      // Could add system message or update participant list
      console.log(`${user.nickname} joined`);
    });

    socket.on('user:left', (user) => {
      console.log(`${user.nickname} left`);
    });

    socket.on('user:updated', (user) => {
      // Update nickname in existing messages if needed
      console.log(`User updated: ${user.nickname}`);
    });

    socket.on('room:expired', () => {
      setError('This room has expired');
      setIsJoined(false);
    });

    socket.on('error', (err) => {
      setError(err.message);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback(async (roomId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      socket.emit('room:join', { roomId }, (response) => {
        if ('error' in response) {
          setError(response.error);
          reject(new Error(response.error));
        } else {
          const joinResponse = response as JoinRoomResponse;
          setRoom(joinResponse.room);
          setSession(joinResponse.session);
          setMessages(joinResponse.recentMessages);
          setIsJoined(true);
          setError(null);
          resolve();
        }
      });
    });
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      socket.emit('message:send', { content }, (response) => {
        resolve(response);
      });
    });
  }, []);

  const updateNickname = useCallback(async (nickname: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      socket.emit('user:updateNickname', { nickname }, (response) => {
        if (response.success) {
          setSession((prev) => prev ? { ...prev, nickname } : null);
        }
        resolve(response);
      });
    });
  }, []);

  return {
    isConnected,
    isJoined,
    room,
    session,
    messages,
    error,
    joinRoom,
    sendMessage,
    updateNickname,
  };
}
