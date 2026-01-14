import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import roomRoutes from './routes/rooms';
import { setupSocketHandlers, startCleanupInterval } from './services/socketService';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData
} from './types';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/rooms', roomRoutes);

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.io server
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup socket handlers
setupSocketHandlers(io);

// Start cleanup interval for expired rooms
const cleanupInterval = startCleanupInterval(60000); // Every minute

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  clearInterval(cleanupInterval);
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🌮 Churro Chat server running on port ${PORT}`);
  console.log(`   Client URL: ${CLIENT_URL}`);
  console.log(`   API: http://localhost:${PORT}/api`);
});

export { app, io, httpServer };
