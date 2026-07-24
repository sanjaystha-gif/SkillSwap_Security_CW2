import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import skillsRoutes from './routes/skillsRoutes.js';
import cookieMiddleware from './middleware/cookieMiddleware.js';
import rateLimiter from './middleware/rateLimiter.js';
import swapsRoutes from './routes/swapsRoutes.js';
import creditsRoutes from './routes/creditsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { AppError, InternalError } from './utils/errors.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);

// Logging
app.use(pinoHttp());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Cookie middleware (populates req.cookies)
app.use(cookieMiddleware);

// Rate limiting to prevent abusive requests
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API version root
app.get('/api/v1', (req, res) => {
  res.json({ message: 'SkillSwap API v1' });
});

// Mount auth routes
app.use('/api/v1/auth', authRoutes);
// Mount user/profile routes
app.use('/api/v1/users', userRoutes);
// Mount skills routes
app.use('/api/v1/skills', skillsRoutes);
// Mount swaps and credits
app.use('/api/v1/swaps', swapsRoutes);
app.use('/api/v1/credits', creditsRoutes);
app.use('/api/v1/admin', adminRoutes);

// TODO: mount other route modules here (users, swaps, credits, moderation, admin)

// Error handling middleware - format AppError instances to the standard envelope
app.use((err, req, res, next) => {
  // If it's an AppError, send its JSON structure
  if (err instanceof AppError) {
    return res.status(err.status).json(err.toJSON());
  }

  // Unexpected errors: log and return a generic envelope
  console.error('Unexpected error:', err);
  const internal = new InternalError(err);
  return res.status(internal.status).json(internal.toJSON());
});

app.listen(PORT, () => {
  console.log(`✓ SkillSwap API listening on port ${PORT}`);
});
