import { CreateRoomResponse, RoomInfoResponse, TTLOption } from '../types';

const API_BASE = '/api';

/**
 * Create a new room
 */
export async function createRoom(ttlHours: TTLOption): Promise<CreateRoomResponse> {
  const response = await fetch(`${API_BASE}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ttlHours }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create room');
  }

  return response.json();
}

/**
 * Get room information
 */
export async function getRoomInfo(roomId: string): Promise<RoomInfoResponse> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get room info');
  }

  return response.json();
}

/**
 * Check if a room exists
 */
export async function checkRoomExists(roomId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/rooms/${roomId}/exists`);

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.exists;
}
