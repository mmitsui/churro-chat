import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageCircle, Users, Shield } from 'lucide-react';
import { createRoom } from '../utils/api';
import { TTLOption } from '../types';

export function CreateRoom() {
  const navigate = useNavigate();
  const [selectedTTL, setSelectedTTL] = useState<TTLOption>(24);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ttlOptions: { value: TTLOption; label: string }[] = [
    { value: 12, label: '12 hours' },
    { value: 24, label: '24 hours' },
    { value: 72, label: '3 days' },
  ];

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await createRoom(selectedTTL);
      // Store ownerToken in localStorage for this room
      if (response.ownerToken) {
        localStorage.setItem(`ownerToken:${response.roomId}`, response.ownerToken);
      }
      navigate(`/room/${response.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">🌮 Churro Chat</h1>
          <p className="text-blue-200 text-lg">
            Anonymous, ephemeral chat rooms — no signup required
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Create room card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create a Chat Room
            </h2>

            {/* TTL Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How long should the room last?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ttlOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedTTL(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTTL === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Clock className={`w-6 h-6 mx-auto mb-2 ${
                      selectedTTL === option.value ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full py-3 px-6 bg-blue-700 text-white font-semibold 
                         rounded-lg hover:bg-blue-800 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-5 shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Instant Chat
              </h3>
              <p className="text-sm text-gray-600">
                Real-time messaging with emojis and links. No images.
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 shadow">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Anonymous
              </h3>
              <p className="text-sm text-gray-600">
                No signup needed. Get a random nickname and color instantly.
              </p>
            </div>

            <div className="bg-white rounded-lg p-5 shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Ephemeral
              </h3>
              <p className="text-sm text-gray-600">
                Rooms auto-expire. No data retained after expiration.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm">
        <p>Up to 300 users per room • Links allowed, images not</p>
      </footer>
    </div>
  );
}
