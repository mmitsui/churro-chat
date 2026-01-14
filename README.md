# 🌮 Churro Chat

Anonymous, ephemeral chat rooms — no signup required.

Anonymous, ephemeral chat rooms — no signup required.

## Features (MVP v1)

- **Room Creation** — Create rooms with TTL options: 12h, 24h, or 72h
- **Immutable Share URL** — Each room gets a unique, shareable URL
- **Anonymous Join** — Users get a random nickname + color (editable)
- **Real-time Messaging** — Text, emojis, and links supported (no images)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + Socket.io + TypeScript
- **Testing**: Jest (server) + Vitest (client)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone and enter the project
cd churro-chat

# Install all dependencies (root, server, and client)
npm install
```

### Development

Run both server and client in development mode:

```bash
npm run dev
```

This starts:
- **Server**: http://localhost:3001
- **Client**: http://localhost:3000

### Running Individually

```bash
# Server only
npm run dev:server

# Client only
npm run dev:client
```

### Environment Configuration

Copy the example env files:

```bash
# Server
cp server/.env.example server/.env

# Client (optional)
cp client/.env.example client/.env
```

Default configuration works out of the box for local development.

## Testing

### Run All Tests

```bash
npm test
```

### Server Tests

```bash
npm run test:server

# Watch mode
cd server && npm run test:watch
```

### Client Tests

```bash
npm run test:client

# Watch mode
cd client && npm run test:watch
```

## Project Structure

```
churro-chat/
├── server/                  # Backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   └── tests/               # Server tests
├── client/                  # Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── test/            # Client tests
│   └── public/              # Static assets
└── package.json             # Root package (workspaces)
```

## API Reference

### REST Endpoints

#### Create Room
```
POST /api/rooms
Body: { "ttlHours": 12 | 24 | 72 }
Response: { "roomId": "abc123", "url": "...", "expiresAt": 1234567890 }
```

#### Get Room Info
```
GET /api/rooms/:roomId
Response: { "room": {...}, "participantCount": 5 }
```

#### Check Room Exists
```
GET /api/rooms/:roomId/exists
Response: { "exists": true }
```

### Socket Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `{ roomId }` | Join a room |
| `message:send` | `{ content }` | Send a message |
| `user:updateNickname` | `{ nickname }` | Update your nickname |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `Message` | New message in room |
| `user:joined` | `{ nickname, color }` | User joined room |
| `user:left` | `{ nickname }` | User left room |
| `user:updated` | `{ sessionId, nickname }` | User updated nickname |
| `room:expired` | — | Room has expired |

## Configuration

### Server Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CLIENT_URL` | `http://localhost:3000` | CORS origin |
| `NODE_ENV` | `development` | Environment |

### Room Constraints

- **Max users per room**: 300
- **TTL options**: 12h, 24h, 72h
- **Max message length**: 2000 characters

## Development Notes

### Message Validation

- HTML is escaped to prevent XSS
- `javascript:`, `data:` URLs are blocked
- Image links are allowed but won't preview
- Unicode emojis are fully supported

### Nickname Rules

- 2-24 characters
- Alphanumeric and underscores only
- Can be changed at any time

## Production Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

For production, consider:
- Using Redis instead of in-memory storage
- Adding rate limiting middleware
- Configuring proper CORS origins
- Setting up SSL/TLS
- Adding logging and monitoring

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

---

Built with 🌮 by the Churro Chat team