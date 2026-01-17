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
  JoinRoomResponse,
  PublicRoom
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

        // Add session to room (this will check if banned)
        const added = roomService.addSession(roomId, session);
        if (!added) {
          // Check if they were rejected due to being banned
          if (roomService.isSessionBanned(roomId, sessionId)) {
            callback({ error: 'You are banned from this room' });
          } else {
            callback({ error: 'Failed to join room' });
          }
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

        // Create public room object (without ownerToken)
        const publicRoom: PublicRoom = {
          id: room.id,
          createdAt: room.createdAt,
          expiresAt: room.expiresAt,
          ttlHours: room.ttlHours,
          capacity: room.capacity
        };

        // Send response to joining user
        const response: JoinRoomResponse = {
          room: publicRoom,
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

    // Handle eject user (owner only)
    socket.on('moderation:eject', async (data, callback) => {
      try {
        const { targetSessionId, ownerToken } = data;
        const { roomId } = socket.data;

        // Validate user is in a room
        if (!roomId) {
          callback({ success: false, error: 'Not in a room' });
          return;
        }

        // Verify owner token
        if (!roomService.verifyOwnerToken(roomId, ownerToken)) {
          callback({ success: false, error: 'Unauthorized: Invalid owner token' });
          return;
        }

        // Get target session to get their nickname
        const targetSession = roomService.getSession(roomId, targetSessionId);
        if (!targetSession) {
          callback({ success: false, error: 'User not found in room' });
          return;
        }

        // Cannot eject yourself
        if (targetSessionId === socket.data.sessionId) {
          callback({ success: false, error: 'Cannot eject yourself' });
          return;
        }

        // Eject the user
        const ejected = roomService.ejectUser(roomId, targetSessionId);
        if (!ejected) {
          callback({ success: false, error: 'Failed to eject user' });
          return;
        }

        // Find and disconnect the target user's socket
        const sockets = await io.in(roomId).fetchSockets();
        for (const s of sockets) {
          if (s.data.sessionId === targetSessionId) {
            s.emit('user:ejected', { sessionId: targetSessionId, reason: 'Ejected by room owner' });
            s.leave(roomId);
            s.disconnect();
            break;
          }
        }

        // Notify other users
        socket.to(roomId).emit('user:left', { nickname: targetSession.nickname });

        callback({ success: true });
        console.log(`User ${targetSession.nickname} (${targetSessionId}) ejected from room ${roomId}`);
      } catch (error) {
        console.error('Error ejecting user:', error);
        callback({ success: false, error: 'Failed to eject user' });
      }
    });

    // Handle ban user (owner only)
    socket.on('moderation:ban', async (data, callback) => {
      try {
        const { targetSessionId, ownerToken } = data;
        const { roomId } = socket.data;

        // Validate user is in a room
        if (!roomId) {
          callback({ success: false, error: 'Not in a room' });
          return;
        }

        // Verify owner token
        if (!roomService.verifyOwnerToken(roomId, ownerToken)) {
          callback({ success: false, error: 'Unauthorized: Invalid owner token' });
          return;
        }

        // Get target session to get their nickname
        const targetSession = roomService.getSession(roomId, targetSessionId);
        if (!targetSession) {
          callback({ success: false, error: 'User not found in room' });
          return;
        }

        // Cannot ban yourself
        if (targetSessionId === socket.data.sessionId) {
          callback({ success: false, error: 'Cannot ban yourself' });
          return;
        }

        // Ban the user
        const banned = roomService.banUser(roomId, targetSessionId);
        if (!banned) {
          callback({ success: false, error: 'Failed to ban user' });
          return;
        }

        // Find and disconnect the target user's socket
        const sockets = await io.in(roomId).fetchSockets();
        for (const s of sockets) {
          if (s.data.sessionId === targetSessionId) {
            s.emit('user:banned', { sessionId: targetSessionId, reason: 'Banned by room owner' });
            s.leave(roomId);
            s.disconnect();
            break;
          }
        }

        // Notify other users
        socket.to(roomId).emit('user:left', { nickname: targetSession.nickname });

        callback({ success: true });
        console.log(`User ${targetSession.nickname} (${targetSessionId}) banned from room ${roomId}`);
      } catch (error) {
        console.error('Error banning user:', error);
        callback({ success: false, error: 'Failed to ban user' });
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
