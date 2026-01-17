import { useState } from 'react';
import { MoreVertical, UserX, Ban, Crown } from 'lucide-react';

interface ModerationMenuProps {
  sessionId: string;
  nickname: string;
  isOwnMessage: boolean;
  isOwner: boolean;
  isOwnerMessage: boolean;
  onEject: (sessionId: string) => Promise<void>;
  onBan: (sessionId: string) => Promise<void>;
  onTransferOwner: (sessionId: string) => Promise<void>;
}

export function ModerationMenu({
  sessionId,
  nickname,
  isOwnMessage,
  isOwner,
  isOwnerMessage,
  onEject,
  onBan,
  onTransferOwner,
}: ModerationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModerating, setIsModerating] = useState(false);

  if (!isOwner || isOwnMessage) {
    return null;
  }

  // Don't show transfer option for current owner
  const showTransferOption = !isOwnerMessage;

  const handleEject = async () => {
    if (!confirm(`Eject "${nickname}" from this room?`)) {
      setIsOpen(false);
      return;
    }
    
    setIsModerating(true);
    try {
      await onEject(sessionId);
    } catch (error) {
      console.error('Failed to eject user:', error);
      alert('Failed to eject user. Please try again.');
    } finally {
      setIsModerating(false);
      setIsOpen(false);
    }
  };

  const handleBan = async () => {
    if (!confirm(`Ban "${nickname}" from this room? They will not be able to rejoin.`)) {
      setIsOpen(false);
      return;
    }
    
    setIsModerating(true);
    try {
      await onBan(sessionId);
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user. Please try again.');
    } finally {
      setIsModerating(false);
      setIsOpen(false);
    }
  };

  const handleTransferOwner = async () => {
    if (!confirm(`Transfer ownership to "${nickname}"? You will lose owner privileges and they will become the new owner.`)) {
      setIsOpen(false);
      return;
    }
    
    setIsModerating(true);
    try {
      await onTransferOwner(sessionId);
    } catch (error) {
      console.error('Failed to transfer ownership:', error);
      alert('Failed to transfer ownership. Please try again.');
    } finally {
      setIsModerating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
        title="Moderation options"
        disabled={isModerating}
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px] overflow-hidden">
            <button
              onClick={handleEject}
              disabled={isModerating}
              className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <UserX className="w-4 h-4 text-orange-600" />
              <span className="text-gray-700">Eject</span>
            </button>
            <div className="border-t border-gray-200" />
            <button
              onClick={handleBan}
              disabled={isModerating}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Ban className="w-4 h-4 text-red-600" />
              <span className="text-red-600 font-medium">Ban</span>
            </button>
            {showTransferOption && (
              <>
                <div className="border-t border-gray-200" />
                <button
                  onClick={handleTransferOwner}
                  disabled={isModerating}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-600 font-medium">Transfer Ownership</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
