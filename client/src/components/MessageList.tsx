import { useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import { Message } from '../types';
import { parseMessageContent, formatTimestamp } from '../utils/format';
import { ModerationMenu } from './ModerationMenu';

interface MessageListProps {
  messages: Message[];
  currentSessionId: string | null;
  isOwner: boolean;
  ownerToken: string | null;
  ownerSessionId: string | null;
  onEject: (sessionId: string, ownerToken: string) => Promise<{ success: boolean; error?: string }>;
  onBan: (sessionId: string, ownerToken: string) => Promise<{ success: boolean; error?: string }>;
  onTransferOwner: (sessionId: string, ownerToken: string) => Promise<{ success: boolean; error?: string }>;
}

export function MessageList({ 
  messages, 
  currentSessionId, 
  isOwner, 
  ownerToken,
  ownerSessionId,
  onEject,
  onBan,
  onTransferOwner
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEject = async (sessionId: string) => {
    if (!ownerToken) return;
    const result = await onEject(sessionId, ownerToken);
    if (!result.success && result.error) {
      alert(`Failed to eject user: ${result.error}`);
    }
  };

  const handleBan = async (sessionId: string) => {
    if (!ownerToken) return;
    const result = await onBan(sessionId, ownerToken);
    if (!result.success && result.error) {
      alert(`Failed to ban user: ${result.error}`);
    }
  };

  const handleTransferOwner = async (sessionId: string) => {
    if (!ownerToken) return;
    const result = await onTransferOwner(sessionId, ownerToken);
    if (!result.success && result.error) {
      alert(`Failed to transfer ownership: ${result.error}`);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-3"
    >
      {messages.map((message) => {
        const isOwnMessage = message.sessionId === currentSessionId;
        const isOwnerMessage = ownerSessionId !== null && message.sessionId === ownerSessionId;
        
        return (
          <div 
            key={message.id}
            className="message-enter group hover:bg-gray-50 rounded-lg p-2 -mx-2"
          >
            <div className="flex items-baseline gap-2">
              <span 
                className="font-semibold"
                style={{ color: message.color }}
              >
                {message.nickname}
              </span>
              {isOwnerMessage && (
                <span 
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                  title="Room Owner"
                >
                  <Shield className="w-3 h-3" />
                  Owner
                </span>
              )}
              <span className="text-xs text-gray-400">
                {formatTimestamp(message.timestamp)}
              </span>
              {isOwnMessage && (
                <span className="text-xs text-gray-400">(you)</span>
              )}
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <ModerationMenu
                  sessionId={message.sessionId}
                  nickname={message.nickname}
                  isOwnMessage={isOwnMessage}
                  isOwner={isOwner}
                  isOwnerMessage={isOwnerMessage}
                  onEject={handleEject}
                  onBan={handleBan}
                  onTransferOwner={handleTransferOwner}
                />
              </div>
            </div>
            <div 
              className="message-content text-gray-800 mt-0.5 break-words"
              dangerouslySetInnerHTML={{ 
                __html: parseMessageContent(message.content) 
              }}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
