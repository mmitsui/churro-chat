import { useState, useEffect } from 'react';
import { Clock, Copy, Check, Edit2, Shield } from 'lucide-react';
import { Room, UserSession } from '../types';
import { formatTimeRemaining } from '../utils/format';

interface RoomHeaderProps {
  room: Room;
  session: UserSession;
  isOwner: boolean;
  onUpdateNickname: (nickname: string) => Promise<{ success: boolean; error?: string }>;
}

export function RoomHeader({ room, session, isOwner, onUpdateNickname }: RoomHeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(room.expiresAt));
  const [copied, setCopied] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(session.nickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  // Update time remaining every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(room.expiresAt));
    }, 60000);

    return () => clearInterval(interval);
  }, [room.expiresAt]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNicknameSubmit = async () => {
    const trimmed = nicknameInput.trim();
    
    if (trimmed === session.nickname) {
      setIsEditingNickname(false);
      return;
    }

    if (trimmed.length < 2 || trimmed.length > 24) {
      setNicknameError('Nickname must be 2-24 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setNicknameError('Only letters, numbers, and underscores allowed');
      return;
    }

    const result = await onUpdateNickname(trimmed);
    
    if (result.success) {
      setIsEditingNickname(false);
      setNicknameError(null);
    } else {
      setNicknameError(result.error || 'Failed to update nickname');
    }
  };

  return (
    <div className="bg-blue-700 text-white px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">🌮 Churro Chat</h1>
          <span className="text-blue-200 text-sm hidden sm:inline">
            Room: {room.id}
          </span>
          {isOwner && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 rounded text-xs font-medium">
              <Shield className="w-3 h-3" />
              Owner
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          {/* Time remaining */}
          <div className="flex items-center gap-1 text-blue-200">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>

          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 
                       hover:bg-blue-500 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* User identity bar */}
      <div className="mt-2 pt-2 border-t border-blue-600 flex items-center gap-2 text-sm">
        <span className="text-blue-200">You are:</span>
        {isEditingNickname ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNicknameSubmit();
                if (e.key === 'Escape') {
                  setIsEditingNickname(false);
                  setNicknameInput(session.nickname);
                  setNicknameError(null);
                }
              }}
              autoFocus
              className="px-2 py-0.5 rounded text-gray-800 text-sm w-40"
              placeholder="Enter nickname..."
            />
            <button
              onClick={handleNicknameSubmit}
              className="px-2 py-0.5 bg-green-600 hover:bg-green-500 rounded text-xs"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditingNickname(false);
                setNicknameInput(session.nickname);
                setNicknameError(null);
              }}
              className="px-2 py-0.5 bg-gray-600 hover:bg-gray-500 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span 
              className="font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: session.color }}
            >
              {session.nickname}
            </span>
            <button
              onClick={() => setIsEditingNickname(true)}
              className="p-1 hover:bg-blue-600 rounded"
              title="Edit nickname"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </>
        )}
        {nicknameError && (
          <span className="text-red-300 text-xs">{nicknameError}</span>
        )}
      </div>
    </div>
  );
}
