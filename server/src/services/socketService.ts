import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import * as roomService from '../services/roomService';
import { generateNickname, generateColor, validateNickname } from '../utils/identity';
import { validateMessage } from '../utils/message';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Message,
  UserSession,
  JoinRoomResponse
} from '../types';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
): void {
  io.on('connection', (socket: TypedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle room join
    socket.on('room:join', async (data, callback) => {
      try {
        const { roomId } = data;

        // Validate room exists
        const room = roomService.getRoom(roomId);
        if (!room) {
          callback({ error: 'Room not found or has expired' });
          return;
        }

        // Check room capacity
        if (roomService.isRoomFull(roomId)) {
          callback({ error: 'Room is full' });
          return;
        }

        // Generate user identity
        const sessionId = uuidv4();
        const nickname = generateNickname();
        const color = generateColor();

        // Create session
        const session: UserSession = {
          sessionId,
          roomId,
          nickname,
          color,
          joinedAt: Date.now()
        };

        // Add session to room
        const added = roomService.addSession(roomId, session);
        if (!added) {
          callback({ error: 'Failed to join room' });
          return;
        }

        // Store session data on socket
        socket.data.sessionId = sessionId;
        socket.data.roomId = roomId;
        socket.data.nickname = nickname;
        socket.data.color = color;

        // Join the socket room
        await socket.join(roomId);

        // Get recent messages
        const recentMessages = roomService.getRecentMessages(roomId);

        // Notify other users
        socket.to(roomId).emit('user:joined', { nickname, color });

        // Send response to joining user
        const response: JoinRoomResponse = {
          room,
          session,
          recentMessages
        };

        callback(response);

        console.log(`User ${nickname} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        callback({ error: 'Failed to join room' });
      }
    });

    // Handle message sending
    socket.on('message:send', (data, callback) => {
      try {
        const { content } = data;
        const { sessionId, roomId, nickname, color } = socket.data;

        // Validate user is in a room
        if (!roomId || !sessionId) {
          callback({ success: false, error: 'Not in a room' });
          return;
        }

        // Check room still exists
        if (!roomService.roomExists(roomId)) {
          callback({ success: false, error: 'Room has expired' });
          socket.emit('room:expired');
          return;
        }

        // Validate message
        const validation = validateMessage(content);
        if (!validation.valid) {
          callback({ success: false, error: validation.error });
          return;
        }

        // Create message
        const message: Message = {
          id: uuidv4(),
          roomId,
          sessionId,
          nickname,
          color,
          content: validation.sanitized,
          timestamp: Date.now()
        };

        // Store message
        roomService.addMessage(message);

        // Broadcast to all users in room (including sender)
        io.to(roomId).emit('message:new', message);

        callback({ success: true });
      } catch (error) {
        console.error('Error sending message:', error);
        callback({ success: false, error: 'Failed to send message' });
      }
    });

    // Handle nickname update
    socket.on('user:updateNickname', (data, callback) => {
      try {
        const { nickname: newNickname } = data;
        const { sessionId, roomId } = socket.data;

        // Validate user is in a room
        if (!roomId || !sessionId) {
          callback({ success: false, error: 'Not in a room' });
          return;
        }

        // Validate nickname
        const validation = validateNickname(newNickname);
        if (!validation.valid) {
          callback({ success: false, error: validation.error });
          return;
        }

        // Update session
        const updated = roomService.updateSessionNickname(roomId, sessionId, newNickname);
        if (!updated) {
          callback({ success: false, error: 'Failed to update nickname' });
          return;
        }

        // Update socket data
        socket.data.nickname = newNickname;

        // Notify other users
        socket.to(roomId).emit('user:updated', { sessionId, nickname: newNickname });

        callback({ success: true });
      } catch (error) {
        console.error('Error updating nickname:', error);
        callback({ success: false, error: 'Failed to update nickname' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const { sessionId, roomId, nickname } = socket.data;

      if (roomId && sessionId) {
        // Remove session from room
        roomService.removeSession(roomId, sessionId);

        // Notify other users
        socket.to(roomId).emit('user:left', { nickname });

        console.log(`User ${nickname} left room ${roomId}`);
      }

      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// Periodic cleanup of expired rooms
export function startCleanupInterval(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    const cleaned = roomService.cleanupExpiredRooms();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired room(s)`);
    }
  }, intervalMs);
}
