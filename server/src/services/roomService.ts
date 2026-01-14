import { v4 as uuidv4 } from 'uuid';
import { Room, TTLOption, Message, UserSession } from '../types';

// In-memory storage (replace with Redis in production)
const rooms = new Map<string, Room>();
const roomMessages = new Map<string, Message[]>();
const roomSessions = new Map<string, Map<string, UserSession>>();

// Constants
const DEFAULT_CAPACITY = 300;
const MAX_RECENT_MESSAGES = 50;

/**
 * Generate a short, URL-friendly room ID
 */
function generateRoomId(): string {
  // Generate a short ID (8 characters)
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new room
 */
export function createRoom(ttlHours: TTLOption): Room {
  // Validate TTL
  if (![12, 24, 72].includes(ttlHours)) {
    throw new Error('Invalid TTL. Must be 12, 24, or 72 hours');
  }

  const id = generateRoomId();
  const now = Date.now();
  const expiresAt = now + ttlHours * 60 * 60 * 1000;

  const room: Room = {
    id,
    createdAt: now,
    expiresAt,
    ttlHours,
    capacity: DEFAULT_CAPACITY,
  };

  rooms.set(id, room);
  roomMessages.set(id, []);
  roomSessions.set(id, new Map());

  return room;
}

/**
 * Get a room by ID
 */
export function getRoom(roomId: string): Room | null {
  const room = rooms.get(roomId);
  
  if (!room) {
    return null;
  }

  // Check if room has expired
  if (Date.now() > room.expiresAt) {
    return null;
  }

  return room;
}

/**
 * Check if a room exists and is not expired
 */
export function roomExists(roomId: string): boolean {
  return getRoom(roomId) !== null;
}

/**
 * Check if a room is expired
 */
export function isRoomExpired(roomId: string): boolean {
  const room = rooms.get(roomId);
  if (!room) return true;
  return Date.now() > room.expiresAt;
}

/**
 * Get the number of participants in a room
 */
export function getParticipantCount(roomId: string): number {
  const sessions = roomSessions.get(roomId);
  return sessions ? sessions.size : 0;
}

/**
 * Check if a room is at capacity
 */
export function isRoomFull(roomId: string): boolean {
  const room = getRoom(roomId);
  if (!room) return true;
  return getParticipantCount(roomId) >= room.capacity;
}

/**
 * Add a session to a room
 */
export function addSession(roomId: string, session: UserSession): boolean {
  const room = getRoom(roomId);
  if (!room) return false;
  
  if (isRoomFull(roomId)) return false;

  const sessions = roomSessions.get(roomId);
  if (!sessions) return false;

  sessions.set(session.sessionId, session);
  return true;
}

/**
 * Remove a session from a room
 */
export function removeSession(roomId: string, sessionId: string): UserSession | null {
  const sessions = roomSessions.get(roomId);
  if (!sessions) return null;

  const session = sessions.get(sessionId);
  if (session) {
    sessions.delete(sessionId);
  }
  return session || null;
}

/**
 * Get a session by ID
 */
export function getSession(roomId: string, sessionId: string): UserSession | null {
  const sessions = roomSessions.get(roomId);
  if (!sessions) return null;
  return sessions.get(sessionId) || null;
}

/**
 * Update a session's nickname
 */
export function updateSessionNickname(roomId: string, sessionId: string, nickname: string): boolean {
  const sessions = roomSessions.get(roomId);
  if (!sessions) return false;

  const session = sessions.get(sessionId);
  if (!session) return false;

  session.nickname = nickname;
  return true;
}

/**
 * Get all sessions in a room
 */
export function getRoomSessions(roomId: string): UserSession[] {
  const sessions = roomSessions.get(roomId);
  if (!sessions) return [];
  return Array.from(sessions.values());
}

/**
 * Add a message to a room
 */
export function addMessage(message: Message): boolean {
  const messages = roomMessages.get(message.roomId);
  if (!messages) return false;

  messages.push(message);

  // Keep only the most recent messages
  if (messages.length > MAX_RECENT_MESSAGES * 2) {
    messages.splice(0, messages.length - MAX_RECENT_MESSAGES);
  }

  return true;
}

/**
 * Get recent messages from a room
 */
export function getRecentMessages(roomId: string, limit: number = MAX_RECENT_MESSAGES): Message[] {
  const messages = roomMessages.get(roomId);
  if (!messages) return [];
  return messages.slice(-limit);
}

/**
 * Delete a room and all its data
 */
export function deleteRoom(roomId: string): boolean {
  const existed = rooms.has(roomId);
  rooms.delete(roomId);
  roomMessages.delete(roomId);
  roomSessions.delete(roomId);
  return existed;
}

/**
 * Clean up expired rooms
 */
export function cleanupExpiredRooms(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [roomId, room] of rooms.entries()) {
    if (now > room.expiresAt) {
      deleteRoom(roomId);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get all active rooms (for debugging/admin)
 */
export function getAllRooms(): Room[] {
  const now = Date.now();
  return Array.from(rooms.values()).filter(room => now <= room.expiresAt);
}

/**
 * Clear all data (for testing)
 */
export function clearAll(): void {
  rooms.clear();
  roomMessages.clear();
  roomSessions.clear();
}

export {
  DEFAULT_CAPACITY,
  MAX_RECENT_MESSAGES,
  generateRoomId
};
