import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent, smartAssign, unassignStudent } from '../controllers/studentsController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireRole('director', 'admin', 'admissions'));

router.get('/smart-assign', smartAssign);
router.get('/', getStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.put('/:id/unassign', unassignStudent);
router.delete('/:id', deleteStudent);

export default router;
