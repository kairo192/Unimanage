import express from 'express';
import {
  getHousingInventory,
  addHousingItem,
  updateHousingItem,
  deleteHousingItem,
  transferHousingItem,
  getHousingTransfers
} from '../controllers/housingController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/inventory', protect, requireRole('director', 'admin', 'maintenance'), getHousingInventory);
router.post('/inventory', protect, requireRole('director', 'admin', 'maintenance'), addHousingItem);
router.put('/inventory/:id', protect, requireRole('director', 'admin', 'maintenance'), updateHousingItem);
router.delete('/inventory/:id', protect, requireRole('director', 'admin', 'maintenance'), deleteHousingItem);
router.post('/transfers', protect, requireRole('director', 'admin', 'maintenance'), transferHousingItem);
router.get('/transfers', protect, requireRole('director', 'admin', 'maintenance'), getHousingTransfers);

export default router;
