import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Logging
app.use(pinoHttp());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API version root
app.get('/api/v1', (req, res) => {
  res.json({ message: 'SkillSwap API v1' });
});

// TODO: Add routes
// - /api/v1/auth/* - Authentication routes
// - /api/v1/users/* - User management
// - /api/v1/swaps/* - Swap management
// - /api/v1/credits/* - Credit ledger
// - /api/v1/moderation/* - Moderation endpoints
// - /api/v1/admin/* - Admin endpoints

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      status: 500
    }
  });
});

app.listen(PORT, () => {
  console.log(`✓ SkillSwap API listening on port ${PORT}`);
});
