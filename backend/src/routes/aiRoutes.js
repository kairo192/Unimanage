import express from 'express';
import rateLimit from 'express-rate-limit';
import { getInsights, getMonthlyReport, getModuleInsights, queryAI, snapshotStats, compareSnapshots, compareModules } from '../controllers/aiController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI insight rate limit exceeded. Please wait before requesting again.' },
});

router.post('/insights', protect, requireRole('director', 'admin'), aiRateLimit, getInsights);
router.get('/monthly-report', protect, requireRole('director', 'admin'), aiRateLimit, getMonthlyReport);
router.get('/insights/:module', protect, requireRole('director', 'admin'), aiRateLimit, getModuleInsights);
router.post('/query', protect, requireRole('director', 'admin'), rateLimit({ windowMs: 1 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Query rate limit exceeded.' } }), queryAI);
router.post('/snapshot', protect, requireRole('director', 'admin'), aiRateLimit, snapshotStats);
router.get('/compare', protect, requireRole('director', 'admin'), aiRateLimit, compareSnapshots);
router.get('/compare/modules', protect, requireRole('director', 'admin'), aiRateLimit, compareModules);

export default router;
