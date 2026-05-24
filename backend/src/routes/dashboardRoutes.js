import express from 'express';
import { getOverview, getAlerts, getStudents, getRooms, createRoom, updateRoom, deleteRoom } from '../controllers/dashboardController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/overview', protect, requireRole('director', 'admin', 'admissions', 'maintenance'), getOverview);
router.get('/alerts',   protect, requireRole('director', 'admin', 'admissions', 'maintenance'), getAlerts);
router.get('/students', protect, requireRole('director', 'admin', 'admissions'), getStudents);
router.get('/rooms',    protect, requireRole('director', 'admin', 'admissions'), getRooms);
router.post('/rooms',   protect, requireRole('director', 'admin', 'admissions'), createRoom);
router.put('/rooms/:id', protect, requireRole('director', 'admin', 'admissions'), updateRoom);
router.delete('/rooms/:id', protect, requireRole('director', 'admin', 'admissions'), deleteRoom);

export default router;
