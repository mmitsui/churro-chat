import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CreateRoom } from './components/CreateRoom';
import { ChatRoom } from './components/ChatRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateRoom />} />
        <Route path="/room/:roomId" element={<ChatRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
