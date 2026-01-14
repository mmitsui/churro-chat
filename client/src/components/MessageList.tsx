import { useEffect, useRef } from 'react';
import { Message } from '../types';
import { parseMessageContent, formatTimestamp } from '../utils/format';

interface MessageListProps {
  messages: Message[];
  currentSessionId: string | null;
}

export function MessageList({ messages, currentSessionId }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        
        return (
          <div 
            key={message.id}
            className="message-enter"
          >
            <div className="flex items-baseline gap-2">
              <span 
                className="font-semibold"
                style={{ color: message.color }}
              >
                {message.nickname}
              </span>
              <span className="text-xs text-gray-400">
                {formatTimestamp(message.timestamp)}
              </span>
              {isOwnMessage && (
                <span className="text-xs text-gray-400">(you)</span>
              )}
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
