import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

import { protect, isDirector } from '../middlewares/authMiddleware.js';
import {
  register,
  login,
  studentLogin,
  studentRegister,
  studentChangePassword,
  directorResetStudentPassword,
  logout,
  getMe,
  getUsers,
  updateUser,
  deleteUser,
  getActivityLogs,
  updateProfile,
  getSessions,
  revokeSession,
} from '../controllers/authController.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, 'avatar-' + hash + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

const router = express.Router();

// Auth
router.post('/register', protect, isDirector, register);
router.post('/login', loginLimiter, login);
router.post('/student-login', studentLogin);
router.post('/student-register', protect, isDirector, studentRegister);
router.put('/student-password', protect, studentChangePassword);
router.put('/students/:id/password', protect, isDirector, directorResetStudentPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

// Sessions
router.get('/sessions', protect, getSessions);
router.post('/revoke-session', protect, revokeSession);

// Director-only: User Management & Audit Logs
router.get('/users', protect, isDirector, getUsers);
router.post('/users', protect, isDirector, register);
router.put('/users/:id', protect, isDirector, updateUser);
router.delete('/users/:id', protect, isDirector, deleteUser);
router.get('/logs', protect, isDirector, getActivityLogs);

export default router;
