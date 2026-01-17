import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { RoomHeader } from './RoomHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { checkRoomExists } from '../utils/api';

export function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isCheckingRoom, setIsCheckingRoom] = useState(true);
  const [roomNotFound, setRoomNotFound] = useState(false);

  const {
    isConnected,
    isJoined,
    room,
    session,
    messages,
    error,
    isOwner,
    ownerSessionId,
    joinRoom,
    sendMessage,
    updateNickname,
    ejectUser,
    banUser,
  } = useSocket();

  // Check if room exists before trying to join
  useEffect(() => {
    async function checkRoom() {
      if (!roomId) {
        navigate('/');
        return;
      }

      const exists = await checkRoomExists(roomId);
      if (!exists) {
        setRoomNotFound(true);
      }
      setIsCheckingRoom(false);
    }

    checkRoom();
  }, [roomId, navigate]);

  // Join room when connected
  useEffect(() => {
    if (isConnected && !isJoined && !isCheckingRoom && !roomNotFound && roomId) {
      joinRoom(roomId).catch((err) => {
        console.error('Failed to join room:', err);
      });
    }
  }, [isConnected, isJoined, isCheckingRoom, roomNotFound, roomId, joinRoom]);

  // Room not found state
  if (roomNotFound) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Room Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This room doesn't exist or has expired. Rooms are automatically 
            deleted after their TTL expires.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 
                       text-white font-semibold rounded-lg hover:bg-blue-800 
                       transition-colors"
          >
            <Home className="w-5 h-5" />
            Create New Room
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isCheckingRoom || !isConnected || !isJoined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {isCheckingRoom ? 'Checking room...' : 
             !isConnected ? 'Connecting...' : 
             'Joining room...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 
                       text-white font-semibold rounded-lg hover:bg-blue-800 
                       transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Main chat room
  if (!room || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <RoomHeader 
        room={room} 
        session={session}
        isOwner={isOwner}
        onUpdateNickname={updateNickname}
      />
      
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto bg-white shadow-lg">
        <MessageList 
          messages={messages} 
          currentSessionId={session.sessionId}
          isOwner={isOwner}
          ownerToken={roomId ? localStorage.getItem(`ownerToken:${roomId}`) : null}
          ownerSessionId={ownerSessionId}
          onEject={ejectUser}
          onBan={banUser}
        />
        
        <MessageInput 
          onSend={sendMessage}
          disabled={!isConnected}
        />
      </main>

      {/* Footer */}
      <footer className="py-3 text-center">
        <Link 
          to="/" 
          className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
        >
          ← Create a new room
        </Link>
      </footer>
    </div>
  );
}
