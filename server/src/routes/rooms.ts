import { Router, Request, Response } from 'express';
import * as roomService from '../services/roomService';
import { CreateRoomRequest, CreateRoomResponse, RoomInfoResponse, TTLOption, PublicRoom } from '../types';

const router = Router();

/**
 * POST /api/rooms
 * Create a new room
 */
router.post('/', (req: Request<{}, {}, CreateRoomRequest>, res: Response) => {
  try {
    const { ttlHours } = req.body;

    // Validate TTL
    if (!ttlHours || ![12, 24, 72].includes(ttlHours)) {
      return res.status(400).json({
        error: 'Invalid TTL. Must be 12, 24, or 72 hours'
      });
    }

    const room = roomService.createRoom(ttlHours as TTLOption);

    // Generate the room URL (immutable)
    const baseUrl = process.env.CLIENT_URL || `http://localhost:${process.env.CLIENT_PORT || 3000}`;
    const url = `${baseUrl}/room/${room.id}`;

    const response: CreateRoomResponse = {
      roomId: room.id,
      url,
      expiresAt: room.expiresAt,
      ownerToken: room.ownerToken
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * GET /api/rooms/:roomId
 * Get room information
 */
router.get('/:roomId', (req: Request<{ roomId: string }>, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = roomService.getRoom(roomId);

    if (!room) {
      return res.status(404).json({
        error: 'Room not found or has expired'
      });
    }

    // Create public room object (without ownerToken)
    const publicRoom: PublicRoom = {
      id: room.id,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      ttlHours: room.ttlHours,
      capacity: room.capacity
    };

    const response: RoomInfoResponse = {
      room: publicRoom,
      participantCount: roomService.getParticipantCount(roomId)
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room information' });
  }
});

/**
 * GET /api/rooms/:roomId/exists
 * Check if a room exists (lightweight check)
 */
router.get('/:roomId/exists', (req: Request<{ roomId: string }>, res: Response) => {
  try {
    const { roomId } = req.params;
    const exists = roomService.roomExists(roomId);

    res.json({ exists });
  } catch (error) {
    console.error('Error checking room:', error);
    res.status(500).json({ error: 'Failed to check room' });
  }
});

export default router;
