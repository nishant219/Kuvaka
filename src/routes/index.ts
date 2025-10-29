import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import * as offerController from '../controllers/offer.controller';
import * as leadController from '../controllers/lead.controller';
import * as scoreController from '../controllers/score.controller';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Offer routes
router.post('/offer', authenticate, offerController.createOffer);
router.get('/offers', authenticate, offerController.getOffers);
router.get('/offer/:id', authenticate, offerController.getOffer);

// Lead upload routes
router.post(
  '/leads/upload',
  authenticate,
  upload.single('file'),
  leadController.uploadLeads
);

// Scoring routes
router.post(
  '/score',
  authenticate,
  upload.single('file'),
  scoreController.scoreLeads
);
router.get('/score/:batchId/status', authenticate, scoreController.getScoreStatus);

// Results routes
router.get('/results', authenticate, leadController.getResults);
router.get('/results/export', authenticate, leadController.exportResults);

export default router;
