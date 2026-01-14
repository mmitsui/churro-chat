import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError(null);

    const result = await onSend(trimmed);
    
    setIsSending(false);

    if (result.success) {
      setContent('');
    } else {
      setError(result.error || 'Failed to send message');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t-2 border-gray-200 bg-gray-50">
      {error && (
        <div className="mb-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          disabled={disabled || isSending}
          rows={1}
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg 
                     focus:outline-none focus:border-blue-500 resize-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <button
          type="submit"
          disabled={disabled || isSending || !content.trim()}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg 
                     hover:bg-blue-800 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Links are clickable • Images won't preview • Max 2000 characters
      </p>
    </form>
  );
}
