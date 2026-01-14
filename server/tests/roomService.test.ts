import * as roomService from '../src/services/roomService';
import { UserSession, Message } from '../src/types';

describe('Room Service', () => {
  beforeEach(() => {
    roomService.clearAll();
  });

  describe('createRoom', () => {
    it('should create a room with 12h TTL', () => {
      const room = roomService.createRoom(12);
      expect(room.id).toBeDefined();
      expect(room.id.length).toBe(8);
      expect(room.ttlHours).toBe(12);
      expect(room.expiresAt).toBeGreaterThan(Date.now());
      expect(room.capacity).toBe(300);
    });

    it('should create a room with 24h TTL', () => {
      const room = roomService.createRoom(24);
      expect(room.ttlHours).toBe(24);
      const expectedExpiry = Date.now() + 24 * 60 * 60 * 1000;
      expect(room.expiresAt).toBeGreaterThan(expectedExpiry - 1000);
      expect(room.expiresAt).toBeLessThan(expectedExpiry + 1000);
    });

    it('should create a room with 72h TTL', () => {
      const room = roomService.createRoom(72);
      expect(room.ttlHours).toBe(72);
    });

    it('should throw for invalid TTL', () => {
      expect(() => roomService.createRoom(6 as any)).toThrow();
      expect(() => roomService.createRoom(48 as any)).toThrow();
    });

    it('should generate unique room IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const room = roomService.createRoom(12);
        ids.add(room.id);
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('getRoom', () => {
    it('should return room by ID', () => {
      const created = roomService.createRoom(12);
      const fetched = roomService.getRoom(created.id);
      expect(fetched).toBeDefined();
      expect(fetched!.id).toBe(created.id);
    });

    it('should return null for non-existent room', () => {
      const room = roomService.getRoom('nonexistent');
      expect(room).toBeNull();
    });

    it('should return null for expired room', () => {
      const room = roomService.createRoom(12);
      // Manually expire the room by manipulating its expiry
      // This is a simplified test - in real scenarios we'd use time mocking
      const rooms = roomService.getAllRooms();
      const createdRoom = rooms.find(r => r.id === room.id);
      if (createdRoom) {
        (createdRoom as any).expiresAt = Date.now() - 1000;
      }
      expect(roomService.getRoom(room.id)).toBeNull();
    });
  });

  describe('roomExists', () => {
    it('should return true for existing room', () => {
      const room = roomService.createRoom(12);
      expect(roomService.roomExists(room.id)).toBe(true);
    });

    it('should return false for non-existent room', () => {
      expect(roomService.roomExists('nonexistent')).toBe(false);
    });
  });

  describe('Session Management', () => {
    let roomId: string;
    let session: UserSession;

    beforeEach(() => {
      const room = roomService.createRoom(12);
      roomId = room.id;
      session = {
        sessionId: 'test-session-1',
        roomId,
        nickname: 'TestUser',
        color: '#FF0000',
        joinedAt: Date.now()
      };
    });

    it('should add session to room', () => {
      const added = roomService.addSession(roomId, session);
      expect(added).toBe(true);
      expect(roomService.getParticipantCount(roomId)).toBe(1);
    });

    it('should get session by ID', () => {
      roomService.addSession(roomId, session);
      const fetched = roomService.getSession(roomId, session.sessionId);
      expect(fetched).toBeDefined();
      expect(fetched!.nickname).toBe('TestUser');
    });

    it('should remove session from room', () => {
      roomService.addSession(roomId, session);
      const removed = roomService.removeSession(roomId, session.sessionId);
      expect(removed).toBeDefined();
      expect(removed!.sessionId).toBe(session.sessionId);
      expect(roomService.getParticipantCount(roomId)).toBe(0);
    });

    it('should update session nickname', () => {
      roomService.addSession(roomId, session);
      const updated = roomService.updateSessionNickname(roomId, session.sessionId, 'NewName');
      expect(updated).toBe(true);
      const fetched = roomService.getSession(roomId, session.sessionId);
      expect(fetched!.nickname).toBe('NewName');
    });

    it('should get all sessions in room', () => {
      roomService.addSession(roomId, session);
      const session2: UserSession = {
        ...session,
        sessionId: 'test-session-2',
        nickname: 'TestUser2'
      };
      roomService.addSession(roomId, session2);
      
      const sessions = roomService.getRoomSessions(roomId);
      expect(sessions).toHaveLength(2);
    });

    it('should not add session to non-existent room', () => {
      const added = roomService.addSession('nonexistent', session);
      expect(added).toBe(false);
    });
  });

  describe('Room Capacity', () => {
    it('should report room not full initially', () => {
      const room = roomService.createRoom(12);
      expect(roomService.isRoomFull(room.id)).toBe(false);
    });

    it('should correctly count participants', () => {
      const room = roomService.createRoom(12);
      for (let i = 0; i < 5; i++) {
        roomService.addSession(room.id, {
          sessionId: `session-${i}`,
          roomId: room.id,
          nickname: `User${i}`,
          color: '#FF0000',
          joinedAt: Date.now()
        });
      }
      expect(roomService.getParticipantCount(room.id)).toBe(5);
    });
  });

  describe('Message Management', () => {
    let roomId: string;

    beforeEach(() => {
      const room = roomService.createRoom(12);
      roomId = room.id;
    });

    it('should add message to room', () => {
      const message: Message = {
        id: 'msg-1',
        roomId,
        sessionId: 'session-1',
        nickname: 'TestUser',
        color: '#FF0000',
        content: 'Hello, World!',
        timestamp: Date.now()
      };
      const added = roomService.addMessage(message);
      expect(added).toBe(true);
    });

    it('should get recent messages', () => {
      for (let i = 0; i < 10; i++) {
        roomService.addMessage({
          id: `msg-${i}`,
          roomId,
          sessionId: 'session-1',
          nickname: 'TestUser',
          color: '#FF0000',
          content: `Message ${i}`,
          timestamp: Date.now() + i
        });
      }
      const messages = roomService.getRecentMessages(roomId, 5);
      expect(messages).toHaveLength(5);
      expect(messages[4].content).toBe('Message 9');
    });

    it('should return empty array for non-existent room', () => {
      const messages = roomService.getRecentMessages('nonexistent');
      expect(messages).toHaveLength(0);
    });
  });

  describe('Room Cleanup', () => {
    it('should delete room and all data', () => {
      const room = roomService.createRoom(12);
      roomService.addSession(room.id, {
        sessionId: 'session-1',
        roomId: room.id,
        nickname: 'TestUser',
        color: '#FF0000',
        joinedAt: Date.now()
      });
      roomService.addMessage({
        id: 'msg-1',
        roomId: room.id,
        sessionId: 'session-1',
        nickname: 'TestUser',
        color: '#FF0000',
        content: 'Hello',
        timestamp: Date.now()
      });

      const deleted = roomService.deleteRoom(room.id);
      expect(deleted).toBe(true);
      expect(roomService.getRoom(room.id)).toBeNull();
      expect(roomService.getParticipantCount(room.id)).toBe(0);
      expect(roomService.getRecentMessages(room.id)).toHaveLength(0);
    });

    it('should clean up expired rooms', () => {
      const room = roomService.createRoom(12);
      // Manually expire
      const allRooms = roomService.getAllRooms();
      const createdRoom = allRooms.find(r => r.id === room.id);
      if (createdRoom) {
        (createdRoom as any).expiresAt = Date.now() - 1000;
      }

      const cleaned = roomService.cleanupExpiredRooms();
      expect(cleaned).toBe(1);
      expect(roomService.getAllRooms()).toHaveLength(0);
    });
  });
});
