import express from 'express';
import multer from 'multer';
import { 
  importStudents, 
  importRooms, 
  exportStudents, 
  exportTickets, 
  exportDashboardReport as exportDashboard,
  parseHeaders
} from '../controllers/excelController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/import/parse-headers', protect, requireRole('director', 'admin'), upload.single('file'), parseHeaders);
router.post('/import/students', protect, requireRole('director', 'admin'), upload.single('file'), importStudents);
router.post('/import/rooms', protect, requireRole('director', 'admin'), upload.single('file'), importRooms);

router.get('/export/students', protect, requireRole('director', 'admin'), exportStudents);
router.get('/export/tickets', protect, requireRole('director', 'admin'), exportTickets);
router.get('/export/dashboard-report', protect, requireRole('director', 'admin'), exportDashboard);

export default router;
