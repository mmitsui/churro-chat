import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  username: string;
  text: string;
  role?: 'Admin';
  timestamp: Date;
}

interface ChatRoomProps {
  room: {
    id: string;
    name: string;
    participants: Array<{ username: string; role?: 'Admin' }>;
    messages: Message[];
  };
  currentUser: string;
  onSendMessage: (text: string) => void;
}

export function ChatRoom({ room, currentUser, onSendMessage }: ChatRoomProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [room.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const getUsernameColor = (username: string): string => {
    const colors = [
      'text-blue-700',
      'text-orange-600',
      'text-teal-700',
      'text-purple-700',
      'text-green-700',
    ];
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded shadow-sm">
      {/* Room Title */}
      <div className="bg-blue-700 text-white px-4 py-3">
        <h2 className="text-xl font-semibold">{room.name}</h2>
      </div>

      {/* Main Chat Area */}
      <div className="flex">
        {/* Participants Sidebar */}
        <aside className="w-64 border-r-2 border-gray-300 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Participants</h3>
          <div className="space-y-2 overflow-y-auto max-h-96">
            {room.participants.map((participant, index) => (
              <div
                key={index}
                className="text-gray-800 border-b border-gray-300 pb-2"
              >
                <span className="font-medium">{participant.username}</span>
                {participant.role === 'Admin' && (
                  <span className="text-orange-600 text-sm ml-1">[Admin]</span>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <div
            ref={messagesContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-white"
            style={{ minHeight: '400px', maxHeight: '500px' }}
          >
            <div className="space-y-3">
              {room.messages.map((message) => (
                <div key={message.id} className="text-gray-800">
                  <span className={`font-semibold ${getUsernameColor(message.username)}`}>
                    {message.username}
                  </span>
                  {message.role === 'Admin' && (
                    <span className="text-orange-600 font-semibold"> [Admin]</span>
                  )}
                  <span className="text-gray-800">: {message.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t-2 border-gray-300 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors font-medium"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
