// Room TTL options in hours
export type TTLOption = 12 | 24 | 72;

// Room data structure (internal, includes ownerToken)
export interface Room {
  id: string;
  createdAt: number;
  expiresAt: number;
  ttlHours: TTLOption;
  capacity: number;
  ownerToken: string; // Secret token for owner moderation
}

// Public room data (sent to clients, excludes ownerToken)
export interface PublicRoom {
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

// API request/response types
export interface CreateRoomRequest {
  ttlHours: TTLOption;
}

export interface CreateRoomResponse {
  roomId: string;
  url: string;
  expiresAt: number;
  ownerToken: string; // Returned only on creation
}

export interface JoinRoomResponse {
  room: PublicRoom;
  session: UserSession;
  recentMessages: Message[];
  ownerSessionId: string | null; // SessionId of the room owner (if owner has joined)
}

export interface RoomInfoResponse {
  room: PublicRoom;
  participantCount: number;
}

// Socket events
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
  'room:join': (data: { roomId: string; ownerToken?: string }, callback: (response: JoinRoomResponse | { error: string }) => void) => void;
  'message:send': (data: { content: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'user:updateNickname': (data: { nickname: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'moderation:eject': (data: { targetSessionId: string; ownerToken: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'moderation:ban': (data: { targetSessionId: string; ownerToken: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
  'moderation:transferOwner': (data: { targetSessionId: string; ownerToken: string }, callback: (response: { success: boolean; error?: string }) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  sessionId: string;
  roomId: string;
  nickname: string;
  color: string;
  isOwner?: boolean; // Set if user authenticated with ownerToken
}
