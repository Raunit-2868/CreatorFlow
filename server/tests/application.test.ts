import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Campaign } from '../src/models/Campaign.js';
import { Application } from '../src/models/Application.js';
import { InfluencerProfile } from '../src/models/InfluencerProfile.js';
import { BrandProfile } from '../src/models/BrandProfile.js';
import { UserRole, CampaignStatus, ApplicationStatus } from '../src/types/index.js';
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
  await Application.deleteMany({});
  await InfluencerProfile.deleteMany({});
  await BrandProfile.deleteMany({});
});

// ─── helpers ───────────────────────────────────────────────────────────────
const createUser = async (role: UserRole, email: string, name = 'Test User') => {
  const user = new User({ name, email, passwordHash: 'hashed', role, isActive: true });
  await user.save();
  const token = generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
  return { user, token };
};

const createCampaign = async (brandUserId: string, status: CampaignStatus = CampaignStatus.PUBLISHED, deadlineOffsetDays = 7) => {
  const campaign = new Campaign({
    brandId: brandUserId,
    title: 'Spring Collection Launch',
    description: 'Looking for lifestyle creators to produce aesthetic Reels.',
    category: 'Fashion & Lifestyle',
    budget: 3500,
    currency: 'USD',
    requiredPlatform: 'Instagram',
    deliverables: ['2x Reels', '3x Stories'],
    applicationDeadline: new Date(Date.now() + deadlineOffsetDays * 24 * 60 * 60 * 1000),
    status,
  });
  await campaign.save();
  return campaign;
};

const validApplicationPayload = (campaignId: string) => ({
  campaignId,
  proposal: 'I would love to collaborate on this campaign! My audience loves high-end fashion styling.',
  expectedCompensation: 1200,
  contentApproach: 'A 60s dynamic transition Reel featuring 3 outfit changes.',
  portfolioLinks: ['https://instagram.com/p/sample1', 'https://tiktok.com/@sample/video/1'],
  relevantPreviousWork: 'Collaborated with Vogue Scandinavia and Zara in Q4.',
});

// ─── tests ─────────────────────────────────────────────────────────────────
describe('Applications API Suite (Phase 5)', () => {
  describe('POST /api/v1/applications — Application Submission', () => {
    it('influencer creates an application successfully and gets 201', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand1@test.com', 'Aura Brand');
      const { token: influencerToken, user: influencerUser } = await createUser(UserRole.INFLUENCER, 'influencer1@test.com', 'Elena Rostova');
      const campaign = await createCampaign(brandUser._id.toString(), CampaignStatus.PUBLISHED);

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload(campaign._id.toString()));

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.PENDING);
      expect(res.body.data.campaignId).toBe(campaign._id.toString());
      expect(res.body.data.influencerId).toBe(influencerUser._id.toString());
      expect(res.body.data.expectedCompensation).toBe(1200);
      expect(res.body.data.proposal).toContain('I would love to collaborate');
    });

    it('brand cannot create application and receives 403', async () => {
      const { user: brand1 } = await createUser(UserRole.BRAND, 'brand1@test.com');
      const { token: brand2Token } = await createUser(UserRole.BRAND, 'brand2@test.com');
      const campaign = await createCampaign(brand1._id.toString(), CampaignStatus.PUBLISHED);

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${brand2Token}`)
        .send(validApplicationPayload(campaign._id.toString()));

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access forbidden');
    });

    it('duplicate application is rejected with 409', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString(), CampaignStatus.PUBLISHED);

      // First application
      const firstRes = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload(campaign._id.toString()));
      expect(firstRes.status).toBe(201);

      // Second application to same campaign
      const secondRes = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload(campaign._id.toString()));

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.message).toContain('already applied');
    });

    it('draft campaign cannot receive applications and returns 400', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString(), CampaignStatus.DRAFT);

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload(campaign._id.toString()));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('published campaigns');
    });

    it('closed or cancelled campaign cannot receive applications', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString(), CampaignStatus.CLOSED);

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload(campaign._id.toString()));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('published campaigns');
    });

    it('expired deadline application is rejected with 400', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      // Expired 2 days ago
      const campaign = await createCampaign(brandUser._id.toString(), CampaignStatus.PUBLISHED, -2);

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload(campaign._id.toString()));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message.toLowerCase()).toContain('deadline');
      expect(res.body.message.toLowerCase()).toContain('passed');
    });

    it('fails validation on short proposal or negative compensation', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString(), CampaignStatus.PUBLISHED);

      // Proposal too short
      const res1 = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send({ ...validApplicationPayload(campaign._id.toString()), proposal: 'Too short' });
      expect(res1.status).toBe(400);

      // Negative compensation
      const res2 = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send({ ...validApplicationPayload(campaign._id.toString()), expectedCompensation: -50 });
      expect(res2.status).toBe(400);
    });

    it('returns 400 on malformed campaign ID', async () => {
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload('invalid-id'));

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('valid campaign ID');
    });

    it('returns 404 when campaign does not exist', async () => {
      const { token: influencerToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', `Bearer ${influencerToken}`)
        .send(validApplicationPayload(fakeId));

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Campaign not found');
    });
  });

  describe('GET /api/v1/applications — List Applications', () => {
    it('influencer views only their own submitted applications', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: inf1Token, user: inf1 } = await createUser(UserRole.INFLUENCER, 'inf1@test.com');
      const { user: inf2 } = await createUser(UserRole.INFLUENCER, 'inf2@test.com');

      const campaign = await createCampaign(brandUser._id.toString());

      // Create app for inf1
      await new Application({
        campaignId: campaign._id,
        influencerId: inf1._id,
        proposal: 'Proposal by Influencer 1 with sufficient detail',
        expectedCompensation: 1000,
        status: ApplicationStatus.PENDING,
      }).save();

      // Create app for inf2
      await new Application({
        campaignId: campaign._id,
        influencerId: inf2._id,
        proposal: 'Proposal by Influencer 2 with sufficient detail',
        expectedCompensation: 1500,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', `Bearer ${inf1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].proposal).toContain('Influencer 1');
    });

    it('campaign owner brand can view applications for its campaigns', async () => {
      const { token: brandToken, user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');

      // Add profile for the influencer
      await new InfluencerProfile({
        userId: infUser._id,
        name: 'Elena Star',
        bio: 'Fashion content creator in Milan',
        niche: ['Fashion', 'Beauty'],
        avgEngagementRate: 4.8,
        totalFollowers: 120000,
        completionPercentage: 85,
      }).save();

      const campaign = await createCampaign(brandUser._id.toString());

      await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Ready to elevate this brand with quality storytelling.',
        expectedCompensation: 800,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .get(`/api/v1/applications?campaignId=${campaign._id}`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].influencerProfile).toBeDefined();
      expect(res.body.data[0].influencerProfile.name).toBe('Elena Star');
      expect(res.body.data[0].influencerProfile.avgEngagementRate).toBe(4.8);
    });

    it('non-owner brand receives 403 when trying to view campaign applications', async () => {
      const { user: ownerBrand } = await createUser(UserRole.BRAND, 'owner@test.com');
      const { token: otherBrandToken } = await createUser(UserRole.BRAND, 'other@test.com');
      const campaign = await createCampaign(ownerBrand._id.toString());

      const res = await request(app)
        .get(`/api/v1/applications?campaignId=${campaign._id}`)
        .set('Authorization', `Bearer ${otherBrandToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not have permission');
    });
  });

  describe('GET /api/v1/applications/:id — Application Details', () => {
    it('influencer can view own application details', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: infToken, user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Comprehensive pitch with detailed deliverable timeline.',
        expectedCompensation: 950,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .get(`/api/v1/applications/${application._id}`)
        .set('Authorization', `Bearer ${infToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(application._id.toString());
      expect(res.body.data.expectedCompensation).toBe(950);
    });

    it('influencer cannot view another influencer application and receives 403', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { user: inf1 } = await createUser(UserRole.INFLUENCER, 'inf1@test.com');
      const { token: inf2Token } = await createUser(UserRole.INFLUENCER, 'inf2@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: inf1._id,
        proposal: 'Pitch from first influencer with required length.',
        expectedCompensation: 900,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .get(`/api/v1/applications/${application._id}`)
        .set('Authorization', `Bearer ${inf2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('do not have permission');
    });

    it('returns 404 on nonexistent application ID', async () => {
      const { token: infToken } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/v1/applications/${fakeId}`)
        .set('Authorization', `Bearer ${infToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Application not found');
    });
  });

  describe('Status Transitions & Actions', () => {
    it('brand owner can shortlist a pending application', async () => {
      const { token: brandToken, user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Shortlisting test proposal with high relevance.',
        expectedCompensation: 1100,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .patch(`/api/v1/applications/${application._id}/shortlist`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.SHORTLISTED);
    });

    it('non-owner brand cannot shortlist application and receives 403', async () => {
      const { user: ownerBrand } = await createUser(UserRole.BRAND, 'owner@test.com');
      const { token: otherBrandToken } = await createUser(UserRole.BRAND, 'other@test.com');
      const { user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(ownerBrand._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Proposal for owner campaign with valid content.',
        expectedCompensation: 1100,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .patch(`/api/v1/applications/${application._id}/shortlist`)
        .set('Authorization', `Bearer ${otherBrandToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Only the campaign owner');
    });

    it('brand owner can reject a pending or shortlisted application', async () => {
      const { token: brandToken, user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Rejection test proposal with sufficient words.',
        expectedCompensation: 1100,
        status: ApplicationStatus.SHORTLISTED,
      }).save();

      const res = await request(app)
        .patch(`/api/v1/applications/${application._id}/reject`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.REJECTED);
    });

    it('brand owner can accept an application', async () => {
      const { token: brandToken, user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Acceptance test proposal with sufficient words.',
        expectedCompensation: 1100,
        status: ApplicationStatus.SHORTLISTED,
      }).save();

      const res = await request(app)
        .patch(`/api/v1/applications/${application._id}/accept`)
        .set('Authorization', `Bearer ${brandToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.ACCEPTED);
    });

    it('cannot reject or withdraw an already accepted application', async () => {
      const { token: brandToken, user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: infToken, user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Terminal status test proposal with length.',
        expectedCompensation: 1100,
        status: ApplicationStatus.ACCEPTED,
      }).save();

      // Brand trying to reject accepted application
      const rejectRes = await request(app)
        .patch(`/api/v1/applications/${application._id}/reject`)
        .set('Authorization', `Bearer ${brandToken}`);
      expect(rejectRes.status).toBe(400);
      expect(rejectRes.body.message).toContain('already accepted');

      // Influencer trying to withdraw accepted application
      const withdrawRes = await request(app)
        .patch(`/api/v1/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${infToken}`);
      expect(withdrawRes.status).toBe(400);
      expect(withdrawRes.body.message).toContain('already accepted');
    });

    it('influencer can withdraw an eligible pending application', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { token: infToken, user: infUser } = await createUser(UserRole.INFLUENCER, 'inf@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: infUser._id,
        proposal: 'Withdrawal test proposal with sufficient length.',
        expectedCompensation: 900,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .patch(`/api/v1/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${infToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(ApplicationStatus.WITHDRAWN);
    });

    it('influencer cannot withdraw another influencer application and receives 403', async () => {
      const { user: brandUser } = await createUser(UserRole.BRAND, 'brand@test.com');
      const { user: inf1 } = await createUser(UserRole.INFLUENCER, 'inf1@test.com');
      const { token: inf2Token } = await createUser(UserRole.INFLUENCER, 'inf2@test.com');
      const campaign = await createCampaign(brandUser._id.toString());

      const application = await new Application({
        campaignId: campaign._id,
        influencerId: inf1._id,
        proposal: 'Another user application withdrawal check.',
        expectedCompensation: 900,
        status: ApplicationStatus.PENDING,
      }).save();

      const res = await request(app)
        .patch(`/api/v1/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${inf2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('only withdraw your own');
    });
  });
});
