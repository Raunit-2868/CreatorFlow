import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('CreatorFlow API Foundation Tests', () => {
  const app = createApp();

  it('GET /api/v1/health returns success and status message', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'CreatorFlow API is running',
    });
  });

  it('GET /api/v1/nonexistent returns 404 with structured error', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('API route not found');
  });

  it('POST /api/v1/campaigns without token returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/campaigns')
      .send({ title: 'Test', description: 'desc', category: 'Fashion', budget: 1000 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
