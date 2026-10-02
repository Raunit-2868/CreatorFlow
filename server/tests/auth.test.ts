import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { UserRole } from '../src/types/index.js';

let mongoServer: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication API Suite (Phase 2)', () => {
  const influencerPayload = {
    name: 'Sarah Creator',
    email: 'sarah@creatorflow.io',
    password: 'password123',
    role: UserRole.INFLUENCER,
  };

  const brandPayload = {
    name: 'Brand Ventures',
    email: 'contact@brandventures.com',
    password: 'password123',
    role: UserRole.BRAND,
  };

  describe('POST /api/v1/auth/register', () => {
    it('successfully registers an INFLUENCER account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(influencerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(influencerPayload.email);
      expect(res.body.data.user.role).toBe(UserRole.INFLUENCER);
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();

      // Check DB
      const userInDb = await User.findOne({ email: influencerPayload.email });
      expect(userInDb).toBeDefined();
      expect(userInDb?.refreshToken).toBe(res.body.data.refreshToken);
    });

    it('successfully registers a BRAND account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(brandPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe(UserRole.BRAND);
    });

    it('rejects public registration for ADMIN role with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...influencerPayload,
          email: 'admin@creatorflow.io',
          role: UserRole.ADMIN,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Public registration is not permitted for Admin accounts');
    });

    it('rejects duplicate email registration with 409 Conflict', async () => {
      await request(app).post('/api/v1/auth/register').send(influencerPayload);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(influencerPayload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('rejects password shorter than 8 characters with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...influencerPayload,
          password: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 8 characters');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(influencerPayload);
    });

    it('successfully logs in with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: influencerPayload.email,
        password: influencerPayload.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('rejects login with incorrect password with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: influencerPayload.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('rejects login with nonexistent email with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@nowhere.com',
        password: 'somepassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('successfully exchanges a valid refresh token for a new access token', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(influencerPayload);

      const refreshToken = registerRes.body.data.refreshToken;

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('rejects invalid refresh token with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me (Protected Route)', () => {
    it('returns current user profile when access token is provided', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(influencerPayload);

      const accessToken = registerRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(influencerPayload.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('returns 401 Unauthorized when no token is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 403 Forbidden when invalid token is provided', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer bad.token.here');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Password Reset Flow', () => {
    it('generates a reset token and updates password successfully', async () => {
      await request(app).post('/api/v1/auth/register').send(influencerPayload);

      // 1. Request forgot password
      const forgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: influencerPayload.email });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.resetToken).toBeDefined();

      const resetToken = forgotRes.body.resetToken;

      // 2. Submit reset password
      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newsecurepassword123',
        });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // 3. Verify old password fails
      const oldLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: influencerPayload.email,
          password: influencerPayload.password,
        });
      expect(oldLoginRes.status).toBe(401);

      // 4. Verify new password succeeds
      const newLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: influencerPayload.email,
          password: 'newsecurepassword123',
        });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes the user session refreshToken', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(influencerPayload);

      const accessToken = registerRes.body.data.accessToken;

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      const userInDb = await User.findOne({ email: influencerPayload.email });
      expect(userInDb?.refreshToken).toBeNull();
    });
  });

  describe('Role-Based Authorization Middleware', () => {
    it('rejects INFLUENCER role trying to access ADMIN endpoint with 403 Forbidden', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(influencerPayload);

      const accessToken = registerRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/v1/admin')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('is not permitted for this resource');
    });

    it('allows ADMIN role to access ADMIN endpoint', async () => {
      // Create admin directly in database (no public registration permitted)
      const adminUser = await User.create({
        name: 'Chief Admin',
        email: 'internal-admin@creatorflow.io',
        passwordHash: 'hashedpassword123',
        role: UserRole.ADMIN,
        isActive: true,
      });

      const { generateAccessToken } = await import('../src/utils/tokenUtils.js');
      const adminToken = generateAccessToken({
        userId: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
      });

      const res = await request(app)
        .get('/api/v1/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
