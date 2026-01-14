import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoom, getRoomInfo, checkRoomExists } from '../utils/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Utilities', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('createRoom', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          roomId: 'abc123',
          url: 'http://localhost:3000/room/abc123',
          expiresAt: Date.now() + 12 * 60 * 60 * 1000,
        }),
      });

      const result = await createRoom(12);

      expect(mockFetch).toHaveBeenCalledWith('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttlHours: 12 }),
      });
      expect(result.roomId).toBe('abc123');
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid TTL' }),
      });

      await expect(createRoom(6 as any)).rejects.toThrow('Invalid TTL');
    });
  });

  describe('getRoomInfo', () => {
    it('should fetch room information', async () => {
      const mockRoom = {
        room: {
          id: 'abc123',
          createdAt: Date.now(),
          expiresAt: Date.now() + 12 * 60 * 60 * 1000,
          ttlHours: 12,
          capacity: 300,
        },
        participantCount: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRoom,
      });

      const result = await getRoomInfo('abc123');

      expect(mockFetch).toHaveBeenCalledWith('/api/rooms/abc123');
      expect(result.room.id).toBe('abc123');
      expect(result.participantCount).toBe(5);
    });

    it('should throw error for non-existent room', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Room not found' }),
      });

      await expect(getRoomInfo('nonexistent')).rejects.toThrow('Room not found');
    });
  });

  describe('checkRoomExists', () => {
    it('should return true for existing room', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true }),
      });

      const result = await checkRoomExists('abc123');

      expect(result).toBe(true);
    });

    it('should return false for non-existent room', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: false }),
      });

      const result = await checkRoomExists('nonexistent');

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await checkRoomExists('abc123');

      expect(result).toBe(false);
    });
  });
});
