import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { InfluencerProfile } from '../src/models/InfluencerProfile.js';
import { BrandProfile } from '../src/models/BrandProfile.js';
import { UserRole } from '../src/types/index.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';

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
  await InfluencerProfile.deleteMany({});
  await BrandProfile.deleteMany({});
});

describe('Profiles API Suite (Phase 3)', () => {
  const createTestUser = async (role: UserRole, email: string, name: string) => {
    const user = new User({
      name,
      email,
      passwordHash: 'hashed_pw',
      role,
      isActive: true,
    });
    await user.save();
    const token = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    return { user, token };
  };

  describe('Influencer Profile API', () => {
    it('creates an influencer profile successfully with completion % and aggregates', async () => {
      const { user, token } = await createTestUser(
        UserRole.INFLUENCER,
        'creator@example.com',
        'Elena Rostova'
      );

      const profilePayload = {
        name: 'Elena Rostova',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Visual storyteller and luxury lifestyle creator.',
        location: 'Mumbai & Berlin',
        niche: ['Fashion & Lifestyle', 'Minimalist Aesthetics'],
        socialPlatforms: [
          {
            platform: 'instagram',
            handle: '@elenarostova',
            followerCount: 185000,
            engagementRate: 5.2,
          },
          {
            platform: 'youtube',
            handle: '@elena_vlogs',
            followerCount: 65000,
            engagementRate: 8.4,
          },
        ],
        languages: ['English', 'Hindi'],
        services: [
          {
            name: 'Dedicated Video & Reel',
            startingPrice: 2500,
            turnaroundDays: 5,
          },
        ],
        portfolio: [
          {
            title: 'Sustainable Silk Campaign',
            mediaUrl: 'https://example.com/portfolio1.jpg',
            brandName: 'Nova Collective',
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/influencers/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profilePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Elena Rostova');
      expect(res.body.data.userId).toBe(user._id.toString());
      expect(res.body.data.totalFollowers).toBe(250000);
      expect(res.body.data.avgEngagementRate).toBe(6.8);
      expect(res.body.data.completionPercentage).toBe(100);
    });

    it('rejects influencer profile creation if name is missing (validation)', async () => {
      const { token } = await createTestUser(
        UserRole.INFLUENCER,
        'creator2@example.com',
        'Test Creator'
      );

      const res = await request(app)
        .post('/api/v1/influencers/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ bio: 'No name given' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/name is required/i);
    });

    it('rejects influencer profile creation by non-influencer roles (Brand / Admin)', async () => {
      const { token } = await createTestUser(
        UserRole.BRAND,
        'brand@example.com',
        'Acme Brand'
      );

      const res = await request(app)
        .post('/api/v1/influencers/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Should Fail' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('retrieves own influencer profile via GET /me', async () => {
      const { user, token } = await createTestUser(
        UserRole.INFLUENCER,
        'creator3@example.com',
        'Priya Sharma'
      );

      await new InfluencerProfile({
        userId: user._id,
        name: 'Priya Sharma',
        bio: 'Tech reviewer',
        niche: ['Technology'],
      }).save();

      const res = await request(app)
        .get('/api/v1/influencers/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Priya Sharma');
    });

    it('returns 404 on GET /me if profile has not been created yet', async () => {
      const { token } = await createTestUser(
        UserRole.INFLUENCER,
        'new@example.com',
        'New Creator'
      );

      const res = await request(app)
        .get('/api/v1/influencers/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('updates own profile and recalculates completion and follower aggregates', async () => {
      const { user, token } = await createTestUser(
        UserRole.INFLUENCER,
        'update@example.com',
        'Initial Name'
      );

      const profile = await new InfluencerProfile({
        userId: user._id,
        name: 'Initial Name',
        bio: 'Initial Bio',
      }).save();

      const res = await request(app)
        .put('/api/v1/influencers/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'Updated bio statement with more details.',
          location: 'Delhi, India',
          niche: ['Travel & Food'],
          socialPlatforms: [
            {
              platform: 'instagram',
              handle: '@traveler',
              followerCount: 50000,
              engagementRate: 4.5,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toBe('Updated bio statement with more details.');
      expect(res.body.data.location).toBe('Delhi, India');
      expect(res.body.data.totalFollowers).toBe(50000);
      expect(res.body.data.avgEngagementRate).toBe(4.5);
    });

    it('allows a brand to view a public influencer profile by ID', async () => {
      const { user: creatorUser } = await createTestUser(
        UserRole.INFLUENCER,
        'creator4@example.com',
        'Public Influencer'
      );
      const { token: brandToken } = await createTestUser(
        UserRole.BRAND,
        'brandviewer@example.com',
        'Brand Viewer'
      );

      const profile = await new InfluencerProfile({
        userId: creatorUser._id,
        name: 'Public Influencer',
        bio: 'Open to sponsorships',
        isPublic: true,
      }).save();

      // Look up by profile ID
      const res = await request(app)
        .get(`/api/v1/influencers/${profile._id}`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Public Influencer');

      // Look up by userId fallback
      const resByUserId = await request(app)
        .get(`/api/v1/influencers/${creatorUser._id}`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(resByUserId.status).toBe(200);
      expect(resByUserId.body.data.name).toBe('Public Influencer');
    });

    it('returns 400 for invalid ObjectId format on public lookup', async () => {
      const res = await request(app).get('/api/v1/influencers/not-a-valid-id');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid.*format/i);
    });
  });

  describe('Brand Profile API', () => {
    it('creates a brand company profile successfully with completion score', async () => {
      const { user, token } = await createTestUser(
        UserRole.BRAND,
        'brandcorp@example.com',
        'Nova Rep'
      );

      const payload = {
        companyName: 'Nova Collective',
        logo: 'https://example.com/logo.png',
        description: 'Sustainable luxury apparel and curated lifestyle.',
        industry: 'Apparel & Fashion',
        website: 'https://novacollective.com',
        location: 'Mumbai & San Francisco',
        companySize: '51-200',
        contactInformation: {
          contactName: 'Sarah Jenkins',
          contactEmail: 'partnerships@novacollective.com',
          contactPhone: '+1-555-0199',
        },
      };

      const res = await request(app)
        .post('/api/v1/brands/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe('Nova Collective');
      expect(res.body.data.userId).toBe(user._id.toString());
      expect(res.body.data.completionPercentage).toBe(100);
    });

    it('rejects brand profile creation if companyName is missing', async () => {
      const { token } = await createTestUser(
        UserRole.BRAND,
        'brandmissing@example.com',
        'Missing Co'
      );

      const res = await request(app)
        .post('/api/v1/brands/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No company name' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/company name is required/i);
    });

    it('rejects brand profile creation by an Influencer role', async () => {
      const { token } = await createTestUser(
        UserRole.INFLUENCER,
        'creatorbrandtest@example.com',
        'Not a brand'
      );

      const res = await request(app)
        .post('/api/v1/brands/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ companyName: 'Should Fail' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('retrieves own brand profile via GET /me', async () => {
      const { user, token } = await createTestUser(
        UserRole.BRAND,
        'brandme@example.com',
        'Brand Owner'
      );

      await new BrandProfile({
        userId: user._id,
        companyName: 'Luxe Goods',
        industry: 'Retail',
      }).save();

      const res = await request(app)
        .get('/api/v1/brands/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe('Luxe Goods');
    });

    it('updates own brand profile successfully', async () => {
      const { user, token } = await createTestUser(
        UserRole.BRAND,
        'brandupdate@example.com',
        'Brand Owner'
      );

      await new BrandProfile({
        userId: user._id,
        companyName: 'Initial Company',
      }).save();

      const res = await request(app)
        .put('/api/v1/brands/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'Nova Studio International',
          website: 'https://novastudio.io',
          industry: 'Media & Entertainment',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe('Nova Studio International');
      expect(res.body.data.website).toBe('https://novastudio.io');
    });

    it('allows an influencer to view a brand profile by ID', async () => {
      const { user: brandUser } = await createTestUser(
        UserRole.BRAND,
        'publicbrand@example.com',
        'Public Brand'
      );
      const { token: influencerToken } = await createTestUser(
        UserRole.INFLUENCER,
        'influencerviewer@example.com',
        'Influencer Viewer'
      );

      const brandProfile = await new BrandProfile({
        userId: brandUser._id,
        companyName: 'Apex Sports',
        industry: 'Athletics & Gear',
      }).save();

      const res = await request(app)
        .get(`/api/v1/brands/${brandProfile._id}`)
        .set('Authorization', `Bearer ${influencerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe('Apex Sports');
    });

    it('returns 404 for nonexistent brand ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/brands/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
