import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Campaign } from '../src/models/Campaign.js';
import { UserRole, CampaignStatus } from '../src/types/index.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';

let mongoServer: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}, 60000);

beforeEach(async () => {
  await User.deleteMany({});
  await Campaign.deleteMany({});
});

// ─── helpers ───────────────────────────────────────────────────────────────
const createUser = async (role: UserRole, email: string, name = 'Test User') => {
  const user = new User({ name, email, passwordHash: 'hashed', role, isActive: true });
  await user.save();
  const token = generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
  return { user, token };
};

const validCampaignPayload = () => ({
  title: 'Summer Luxury Campaign',
  description: 'Promote our summer collection across key lifestyle influencers.',
  category: 'Fashion & Lifestyle',
  budget: 5000,
  currency: 'USD',
  targetAudience: 'Women 25-35 interested in sustainable fashion',
  location: 'Mumbai',
  requiredPlatform: 'Instagram',
  followerRange: { min: 10000, max: 500000 },
  engagementRequirement: 3.5,
  contentType: 'Reel',
  deliverables: ['3x Reels', '5x Stories'],
  applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  campaignDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});

// ─── tests ─────────────────────────────────────────────────────────────────
describe('Campaigns API Suite (Phase 4)', () => {
  describe('POST /api/v1/campaigns — Create Campaign', () => {
    it('brand creates a campaign and gets 201', async () => {
      const { token } = await createUser(UserRole.BRAND, 'brand@test.com', 'Nova Brand');

      const res = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send(validCampaignPayload());

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Summer Luxury Campaign');
      expect(res.body.data.status).toBe(CampaignStatus.DRAFT);
    });

    it('brand can create campaign with PUBLISHED status directly', async () => {
      const { token } = await createUser(UserRole.BRAND, 'brand2@test.com', 'Nova Brand 2');

      const res = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validCampaignPayload(), status: CampaignStatus.PUBLISHED });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe(CampaignStatus.PUBLISHED);
    });

    it('influencer cannot create a campaign — returns 403', async () => {
      const { token } = await createUser(UserRole.INFLUENCER, 'influencer@test.com');

      const res = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send(validCampaignPayload());

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('unauthenticated request cannot create campaign — returns 401', async () => {
      const res = await request(app)
        .post('/api/v1/campaigns')
        .send(validCampaignPayload());

      expect(res.status).toBe(401);
    });

    it('returns 400 when title is missing', async () => {
      const { token } = await createUser(UserRole.BRAND, 'brand3@test.com');
      const payload = validCampaignPayload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (payload as any).title;

      const res = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/title/i);
    });

    it('returns 400 when budget is negative', async () => {
      const { token } = await createUser(UserRole.BRAND, 'brand4@test.com');

      const res = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validCampaignPayload(), budget: -100 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/budget/i);
    });
  });

  describe('GET /api/v1/campaigns — List Campaigns', () => {
    it('influencer sees only published campaigns', async () => {
      const { token: brandToken, user: brandUser } = await createUser(UserRole.BRAND, 'brand5@test.com');
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');

      // Create draft and published campaigns
      await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.DRAFT });
      await Campaign.create({ ...validCampaignPayload(), title: 'Published Campaign', brandId: brandUser._id, status: CampaignStatus.PUBLISHED });

      // Influencer should only see published
      const res = await request(app)
        .get('/api/v1/campaigns')
        .set('Authorization', `Bearer ${influencerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Published Campaign');

      // Brand sees all their campaigns
      const brandRes = await request(app)
        .get('/api/v1/campaigns')
        .set('Authorization', `Bearer ${brandToken}`);

      expect(brandRes.status).toBe(200);
      expect(brandRes.body.data.length).toBe(2);
    });

    it('filters by category server-side', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand6@test.com');
      await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED, category: 'Fashion & Lifestyle' });
      await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED, category: 'Food & Beverage', title: 'Food Campaign' });

      const res = await request(app)
        .get('/api/v1/campaigns?category=Food');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('Food & Beverage');
    });

    it('filters by platform server-side', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand7@test.com');
      await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED, requiredPlatform: 'Instagram' });
      await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED, requiredPlatform: 'YouTube', title: 'YT Campaign' });

      const res = await request(app)
        .get('/api/v1/campaigns?platform=youtube');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].requiredPlatform).toBe('YouTube');
    });

    it('filters by budget range', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand8@test.com');
      await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED, budget: 1000 });
      await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED, budget: 10000, title: 'Big Campaign' });

      const res = await request(app)
        .get('/api/v1/campaigns?minBudget=5000');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].budget).toBe(10000);
    });

    it('returns paginated results with correct metadata', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand9@test.com');
      // Create 5 published campaigns
      for (let i = 0; i < 5; i++) {
        await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED, title: `Campaign ${i}` });
      }

      const res = await request(app)
        .get('/api/v1/campaigns?page=1&limit=3');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      expect(res.body.pagination.total).toBe(5);
      expect(res.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/v1/campaigns/:id — Single Campaign', () => {
    it('anyone can view a published campaign', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand10@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.PUBLISHED });

      const res = await request(app).get(`/api/v1/campaigns/${campaign._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(campaign._id.toString());
    });

    it('draft campaign is only visible to owner brand', async () => {
      const { token: ownerToken, user: brandUser } = await createUser(UserRole.BRAND, 'brand11@test.com');
      const { token: otherBrandToken } = await createUser(UserRole.BRAND, 'brand12@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id, status: CampaignStatus.DRAFT });

      // Owner can see it
      const ownerRes = await request(app)
        .get(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(ownerRes.status).toBe(200);

      // Other brand cannot
      const otherRes = await request(app)
        .get(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${otherBrandToken}`);
      expect(otherRes.status).toBe(403);

      // Unauthenticated cannot
      const anonRes = await request(app).get(`/api/v1/campaigns/${campaign._id}`);
      expect(anonRes.status).toBe(403);
    });

    it('returns 400 for invalid campaign ID', async () => {
      const res = await request(app).get('/api/v1/campaigns/not-a-valid-id');
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('returns 404 for missing campaign', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/campaigns/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/campaigns/:id — Update Campaign', () => {
    it('owner brand can update campaign title', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand13@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id });

      const res = await request(app)
        .put(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('non-owner brand cannot update campaign — returns 403', async () => {
      const { user: ownerUser } = await createUser(UserRole.BRAND, 'brand14@test.com');
      const { token: otherToken } = await createUser(UserRole.BRAND, 'brand15@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: ownerUser._id });

      const res = await request(app)
        .put(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Steal' });

      expect(res.status).toBe(403);
    });

    it('influencer cannot update campaign — returns 403', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand16@test.com');
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf2@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: brandUser._id });

      const res = await request(app)
        .put(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${influencerToken}`)
        .send({ title: 'Steal' });

      expect(res.status).toBe(403);
    });

    it('prevents invalid status transitions — 422', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand17@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.DRAFT });

      // DRAFT → COMPLETED is invalid
      const res = await request(app)
        .put(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: CampaignStatus.COMPLETED });

      expect(res.status).toBe(422);
      expect(res.body.message).toMatch(/invalid status transition/i);
    });

    it('allows valid status transition DRAFT → PUBLISHED', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand18@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.DRAFT });

      const res = await request(app)
        .put(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: CampaignStatus.PUBLISHED });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(CampaignStatus.PUBLISHED);
    });
  });

  describe('DELETE /api/v1/campaigns/:id — Delete Campaign', () => {
    it('owner can delete a DRAFT campaign', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand19@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.DRAFT });

      const res = await request(app)
        .delete(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Campaign.findById(campaign._id);
      expect(deleted).toBeNull();
    });

    it('cannot delete a PUBLISHED campaign — returns 422', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand20@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.PUBLISHED });

      const res = await request(app)
        .delete(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(422);
    });

    it('non-owner cannot delete — returns 403', async () => {
      const { user: ownerUser } = await createUser(UserRole.BRAND, 'brand21@test.com');
      const { token: otherToken } = await createUser(UserRole.BRAND, 'brand22@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: ownerUser._id });

      const res = await request(app)
        .delete(`/api/v1/campaigns/${campaign._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/campaigns/:id/publish — Publish Action', () => {
    it('publishes a DRAFT campaign successfully', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand23@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.DRAFT });

      const res = await request(app)
        .patch(`/api/v1/campaigns/${campaign._id}/publish`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(CampaignStatus.PUBLISHED);
    });

    it('cannot publish an already PUBLISHED campaign — returns 422', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand24@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.PUBLISHED });

      const res = await request(app)
        .patch(`/api/v1/campaigns/${campaign._id}/publish`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(422);
    });
  });

  describe('PATCH /api/v1/campaigns/:id/close — Close Action', () => {
    it('closes a PUBLISHED campaign', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand25@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.PUBLISHED });

      const res = await request(app)
        .patch(`/api/v1/campaigns/${campaign._id}/close`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(CampaignStatus.CLOSED);
    });

    it('cannot close a DRAFT campaign — returns 422', async () => {
      const { token, user } = await createUser(UserRole.BRAND, 'brand26@test.com');
      const campaign = await Campaign.create({ ...validCampaignPayload(), brandId: user._id, status: CampaignStatus.DRAFT });

      const res = await request(app)
        .patch(`/api/v1/campaigns/${campaign._id}/close`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(422);
    });
  });
});
