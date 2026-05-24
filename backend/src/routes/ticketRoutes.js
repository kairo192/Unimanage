import express from 'express';
import { createTicket, getTickets, updateStatus, deleteTicket, uploadImage } from '../controllers/ticketController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadTicketImage } from '../middlewares/uploadTicketImage.js';

const router = express.Router();

router.post('/', protect, createTicket);
router.get('/', protect, getTickets);
router.post('/image-upload', protect, uploadTicketImage.single('image'), uploadImage);
router.put('/:id/status', protect, updateStatus);
router.delete('/:id', protect, deleteTicket);

export default router;
