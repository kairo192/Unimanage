import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import excelRoutes from './routes/excelRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import studentsRoutes from './routes/studentsRoutes.js';
import cateringRoutes from './routes/cateringRoutes.js';
import housingRoutes from './routes/housingRoutes.js';
import itRoutes from './routes/itRoutes.js';

dotenv.config();

const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const supabaseUrl = process.env.SUPABASE_URL || 'https://eljyjujwwvlzupvloeki.supabase.co';

app.use(helmet({
  crossOriginResourcePolicy: isProduction ? { policy: 'same-origin' } : false,
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', supabaseUrl],
      connectSrc: ["'self'", 'https://openrouter.ai', supabaseUrl],
    },
  } : false,
}));

const allowedOrigins = [
  ...(process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean),
  process.env.APP_URL || '',
].filter(Boolean);

app.use(cors({
  origin: isProduction
    ? (origin, callback) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : '*',
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'UniManage AI API'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/catering', cateringRoutes);
app.use('/api/housing', housingRoutes);
app.use('/api/it', itRoutes);

// Generic 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
