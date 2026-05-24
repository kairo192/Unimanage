import express from 'express';
import { 
  getCateringInventory, 
  addCateringItem, 
  updateCateringItem, 
  deleteCateringItem, 
  consumeCateringItem, 
  getCateringConsumption 
} from '../controllers/cateringController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('director', 'admin'));

router.get('/inventory', getCateringInventory);
router.post('/inventory', addCateringItem);
router.put('/inventory/:id', updateCateringItem);
router.delete('/inventory/:id', deleteCateringItem);

router.post('/consume', consumeCateringItem);
router.get('/consumption', getCateringConsumption);

export default router;
