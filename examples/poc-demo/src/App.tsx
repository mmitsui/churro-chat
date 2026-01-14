import { useState } from 'react';
import { ChatRoom } from './components/ChatRoom';
import { User } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  text: string;
  role?: 'Admin';
  timestamp: Date;
}

interface ChatRoomData {
  id: string;
  name: string;
  participants: Array<{ username: string; role?: 'Admin' }>;
  messages: Message[];
}

const initialRooms: ChatRoomData[] = [
  {
    id: '1',
    name: 'Hackathon 2026 NYU Tandon Games',
    participants: [
      { username: 'Rob_Stein', role: 'Admin' },
      { username: 'Eric_Sands' },
      { username: '_Polar_Games' },
      { username: 'AstroSara' },
      { username: 'romelpatel' },
      { username: 'AlbertCamus' },
      { username: 'JustMe' },
      { username: 'Curious_Badger' },
      { username: 'lola_int...' },
    ],
    messages: [
      { id: '1', username: 'AstroSara', text: 'Wow, that last level was insane!', timestamp: new Date(Date.now() - 600000) },
      { id: '2', username: 'Eric_Sands', text: "Can't believe we pulled that off in time!", timestamp: new Date(Date.now() - 540000) },
      { id: '3', username: '_Polar_Games', text: 'Great teamwork, everyone!', timestamp: new Date(Date.now() - 480000) },
      { id: '4', username: 'romelpatel', text: "What's the next challenge?", timestamp: new Date(Date.now() - 420000) },
      { id: '5', username: 'Rob_Stein', role: 'Admin', text: 'Next challenge is a speedrun. Get ready!', timestamp: new Date(Date.now() - 360000) },
      { id: '6', username: 'JustMe', text: "Speedrun time! Let's do this!", timestamp: new Date(Date.now() - 300000) },
      { id: '7', username: 'Curious_Badger', text: "Hope I'm fast enough for this one!", timestamp: new Date(Date.now() - 240000) },
      { id: '8', username: 'AlbertCamus', text: 'This is going to be intense!', timestamp: new Date(Date.now() - 180000) },
      { id: '9', username: 'lola_int...', text: 'Good luck, everyone!', timestamp: new Date(Date.now() - 120000) },
      { id: '10', username: 'Eric_Sands', text: 'Starting in 3... 2... 1. Go!', timestamp: new Date(Date.now() - 60000) },
      { id: '11', username: 'AstroSara', text: "Let's crush it!", timestamp: new Date(Date.now() - 30000) },
    ],
  },
  {
    id: '2',
    name: 'General Discussion',
    participants: [
      { username: 'Rob_Stein', role: 'Admin' },
      { username: 'Eric_Sands' },
      { username: 'AstroSara' },
    ],
    messages: [
      { id: '1', username: 'AstroSara', text: 'Hey everyone!', timestamp: new Date(Date.now() - 120000) },
      { id: '2', username: 'Eric_Sands', text: 'How is everyone doing today?', timestamp: new Date(Date.now() - 60000) },
    ],
  },
  {
    id: '3',
    name: 'Tech Talk',
    participants: [
      { username: 'Rob_Stein', role: 'Admin' },
      { username: 'AlbertCamus' },
      { username: 'Curious_Badger' },
    ],
    messages: [
      { id: '1', username: 'Curious_Badger', text: 'Anyone working on interesting projects?', timestamp: new Date(Date.now() - 180000) },
      { id: '2', username: 'AlbertCamus', text: "I'm building a web app with React!", timestamp: new Date(Date.now() - 90000) },
    ],
  },
];

export default function App() {
  const [currentUser] = useState('Matt_Polar314');
  const [rooms, setRooms] = useState(initialRooms);
  const [currentRoomId, setCurrentRoomId] = useState('1');

  const currentRoom = rooms.find(room => room.id === currentRoomId) || rooms[0];

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      username: currentUser,
      text,
      timestamp: new Date(),
    };

    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === currentRoomId
          ? { ...room, messages: [...room.messages, newMessage] }
          : room
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">Churro Chat</h1>
          <div className="flex items-center gap-2 text-gray-700">
            <span>user: <strong>{currentUser}</strong></span>
            <User className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <ChatRoom
          room={currentRoom}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
        />

        {/* Navigation Links */}
        <nav className="mt-8 flex justify-center gap-6 text-blue-700">
          <button className="hover:underline">Churro Chat Home</button>
          <span className="text-gray-400">|</span>
          <button className="hover:underline">Make your own chat</button>
          <span className="text-gray-400">|</span>
          <button
            className="hover:underline"
            onClick={() => {
              const roomIds = rooms.map(r => r.id);
              const currentIndex = roomIds.indexOf(currentRoomId);
              const nextIndex = (currentIndex + 1) % roomIds.length;
              setCurrentRoomId(roomIds[nextIndex]);
            }}
          >
            Change chats
          </button>
          <span className="text-gray-400">|</span>
          <button className="hover:underline">Find your chat</button>
        </nav>
      </main>
    </div>
  );
}
