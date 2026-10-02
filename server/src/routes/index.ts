import { Router, Request, Response } from 'express';
import healthRoutes from './healthRoutes.js';

const router = Router();

// Health check
router.use('/', healthRoutes);

// Helper for placeholder route handlers
const createPlaceholderRouter = (domain: string) => {
  const r = Router();
  r.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: `${domain} endpoint initialized (Phase 1 foundation)`
    });
  });
  return r;
};

// Mount all v1 routes
router.use('/auth', createPlaceholderRouter('Auth'));
router.use('/users', createPlaceholderRouter('Users'));
router.use('/influencers', createPlaceholderRouter('Influencers'));
router.use('/brands', createPlaceholderRouter('Brands'));
router.use('/campaigns', createPlaceholderRouter('Campaigns'));
router.use('/applications', createPlaceholderRouter('Applications'));
router.use('/collaborations', createPlaceholderRouter('Collaborations'));
router.use('/messages', createPlaceholderRouter('Messages'));
router.use('/notifications', createPlaceholderRouter('Notifications'));
router.use('/analytics', createPlaceholderRouter('Analytics'));
router.use('/admin', createPlaceholderRouter('Admin'));
router.use('/ai', createPlaceholderRouter('AI'));

export default router;
