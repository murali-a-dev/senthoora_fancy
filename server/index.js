import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { initFirebase } from './config/firebase.js';

import adminRouter from './routes/admin.js';
import inventoryRouter from './routes/inventory.js';
import uploadRouter from './routes/upload.js';
import companyRouter from './routes/company.js';
import inquiryRouter from './routes/inquiry.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase / persistent fallback store
initFirebase();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Response headers for fast updates
app.use('/api', (req, res, next) => {
  res.setHeader('X-Powered-By', 'Sri Senthoora Showcase Engine');
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
  next();
});

// Rate limiting: Protect admin authentication from brute-force attempts
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many PIN verification attempts. Please wait 15 minutes before trying again.',
  },
});

// Rate limiting: Protect public inquiry endpoint against automated spam
const inquiryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 submissions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many inquiries submitted from this connection. Please wait a minute before submitting again.',
  },
});

// API Routes with rate limiting where appropriate
app.use('/api/admin/auth', adminAuthLimiter);
app.use('/api/admin', adminRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/company', companyRouter);
app.use('/api/inquiry', inquiryLimiter, inquiryRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'Sri Senthoora Fancy Store Showcase API',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unrecognized /api/* endpoints
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Static frontend serving if built
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('Not found');
  });
});

// Global Error Handler Middleware
app.use((err, req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Sri Senthoora Fancy Store API running on http://localhost:${PORT}`);
});
