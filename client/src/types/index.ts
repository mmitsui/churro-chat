// Room TTL options in hours
export type TTLOption = 12 | 24 | 72;

// Room data structure (public, excludes ownerToken)
export interface Room {
  id: string;
  createdAt: number;
  expiresAt: number;
  ttlHours: TTLOption;
  capacity: number;
}

// User session in a room
export interface UserSession {
  sessionId: string;
  roomId: string;
  nickname: string;
  color: string;
  joinedAt: number;
}

// Message structure
export interface Message {
  id: string;
  roomId: string;
  sessionId: string;
  nickname: string;
  color: string;
  content: string;
  timestamp: number;
}

// API response types
export interface CreateRoomResponse {
  roomId: string;
  url: string;
  expiresAt: number;
  ownerToken: string; // Secret token for owner moderation
}

export interface JoinRoomResponse {
  room: Room;
  session: UserSession;
  recentMessages: Message[];
  ownerSessionId: string | null; // SessionId of the room owner (if owner has joined)
}

export interface RoomInfoResponse {
  room: Room;
  participantCount: number;
}

// Socket event types
export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'user:joined': (user: { nickname: string; color: string }) => void;
  'user:left': (user: { nickname: string }) => void;
  'user:updated': (user: { sessionId: string; nickname: string }) => void;
  'owner:identified': (data: { ownerSessionId: string }) => void;
  'owner:transferred': (data: { ownerSessionId: string; previousOwnerSessionId: string; ownerToken?: string }) => void;
  'user:ejected': (data: { sessionId: string; reason?: string }) => void;
  'user:banned': (data: { sessionId: string; reason?: string }) => void;
  'room:expired': () => void;
  'error': (error: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'room:join': (data: { roomId: string }, callback: (response: JoinRoomResponse | { error: string }) => void) => void;
  'message:send': (data: { content: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'user:updateNickname': (data: { nickname: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'moderation:eject': (data: { targetSessionId: string; ownerToken: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'moderation:ban': (data: { targetSessionId: string; ownerToken: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'moderation:transferOwner': (data: { targetSessionId: string; ownerToken: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
}
