import express from 'express';
import request from 'supertest';
import roomRoutes from '../src/routes/rooms';
import * as roomService from '../src/services/roomService';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/rooms', roomRoutes);

describe('Room API Routes', () => {
  beforeEach(() => {
    roomService.clearAll();
  });

  describe('POST /api/rooms', () => {
    it('should create a room with 12h TTL', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 12 })
        .expect(201);

      expect(response.body.roomId).toBeDefined();
      expect(response.body.url).toContain(response.body.roomId);
      expect(response.body.expiresAt).toBeGreaterThan(Date.now());
      expect(response.body.ownerToken).toBeDefined();
      expect(response.body.ownerToken.length).toBe(32);
    });

    it('should create a room with 24h TTL', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 24 })
        .expect(201);

      expect(response.body.roomId).toBeDefined();
    });

    it('should create a room with 72h TTL', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 72 })
        .expect(201);

      expect(response.body.roomId).toBeDefined();
    });

    it('should reject invalid TTL', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 48 })
        .expect(400);

      expect(response.body.error).toContain('Invalid TTL');
    });

    it('should reject missing TTL', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/rooms/:roomId', () => {
    it('should return room information', async () => {
      // Create a room first
      const createResponse = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 12 });

      const { roomId } = createResponse.body;

      const response = await request(app)
        .get(`/api/rooms/${roomId}`)
        .expect(200);

      expect(response.body.room).toBeDefined();
      expect(response.body.room.id).toBe(roomId);
      expect(response.body.participantCount).toBe(0);
    });

    it('should return 404 for non-existent room', async () => {
      const response = await request(app)
        .get('/api/rooms/nonexistent')
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/rooms/:roomId/exists', () => {
    it('should return exists: true for existing room', async () => {
      const createResponse = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 12 });

      const { roomId } = createResponse.body;

      const response = await request(app)
        .get(`/api/rooms/${roomId}/exists`)
        .expect(200);

      expect(response.body.exists).toBe(true);
    });

    it('should return exists: false for non-existent room', async () => {
      const response = await request(app)
        .get('/api/rooms/nonexistent/exists')
        .expect(200);

      expect(response.body.exists).toBe(false);
    });
  });

  describe('Owner Token in Room Creation', () => {
    it('should return ownerToken when creating room', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 12 })
        .expect(201);

      expect(response.body.ownerToken).toBeDefined();
      expect(typeof response.body.ownerToken).toBe('string');
      expect(response.body.ownerToken.length).toBe(32);
    });

    it('should return unique owner tokens for different rooms', async () => {
      const response1 = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 12 })
        .expect(201);

      const response2 = await request(app)
        .post('/api/rooms')
        .send({ ttlHours: 24 })
        .expect(201);

      expect(response1.body.ownerToken).not.toBe(response2.body.ownerToken);
    });
  });
});
