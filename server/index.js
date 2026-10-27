import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { initFirebase } from './config/firebase.js';

import adminRouter from './routes/admin.js';
import inventoryRouter, { getCachedInventory } from './routes/inventory.js';
import uploadRouter from './routes/upload.js';
import companyRouter, { getCachedCompany } from './routes/company.js';
import inquiryRouter from './routes/inquiry.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase
initFirebase();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
    : []),
];

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (like mobile apps, curl, same-origin)
  if (!origin) return true;

  // In development, allow all origins (support LAN testing with --host, mobile testing, etc.)
  if (process.env.NODE_ENV !== 'production') return true;

  // Explicit whitelist match
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  // Allow standard cloud hosting domains
  if (
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    origin.endsWith('.netlify.app') ||
    origin.endsWith('.railway.app')
  ) {
    return true;
  }

  // Allow localhost and 127.0.0.1 on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  // Allow local LAN IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x) on any port
  if (
    /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
      origin
    )
  ) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.options('*', cors());

// HTTP Gzip/deflate compression for fast responses
app.use(compression());

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Response headers: identification
app.use('/api', (req, res, next) => {
  res.setHeader('X-Powered-By', 'Sri Senthoora Showcase Engine');
  next();
});

// Rate limiting: Protect admin authentication from brute-force attempts
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // Generous in development to prevent lockouts
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
  max: process.env.NODE_ENV === 'production' ? 10 : 60,
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

  // Background pre-warming: pre-load inventory and store details so user requests are instant
  setTimeout(async () => {
    try {
      const [inv] = await Promise.all([
        getCachedInventory().catch((err) => console.warn('[Warmup] Inventory prewarm notice:', err.message)),
        getCachedCompany().catch((err) => console.warn('[Warmup] Company prewarm notice:', err.message)),
      ]);
      console.log(`⚡ Showcase caches pre-warmed (${inv ? inv.length : 0} products ready in memory)`);
    } catch {
      // Non-blocking warmup
    }
  }, 100);
});
