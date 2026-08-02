import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import skillsRoutes from './routes/skillsRoutes.js';
import cookieMiddleware from './middleware/cookieMiddleware.js';
import csrfMiddleware from './middleware/csrfMiddleware.js';
import authMiddleware from './middleware/authMiddleware.js';
import rateLimiter from './middleware/rateLimiter.js';
import swapsRoutes from './routes/swapsRoutes.js';
import creditsRoutes from './routes/creditsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationsRoutes from './routes/notificationsRoutes.js';
import { AppError, InternalError } from './utils/errors.js';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5001;

app.set('trust proxy', 1);
app.use(helmet());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

const allowedCorsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedCorsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

app.use(cookieMiddleware);
app.use(csrfMiddleware);
app.use(rateLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1', (req, res) => {
  res.json({ message: 'SkillSwap API v1' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/skills', skillsRoutes);
app.use('/api/v1/swaps', swapsRoutes);
app.use('/api/v1/credits', creditsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/admin', authMiddleware, adminRoutes);

app.use((err, req, res, next) => {
  void next;
  if (err instanceof AppError) {
    return res.status(err.status).json(err.toJSON());
  }

  logger.error({ err }, 'Unexpected error');
  const internal = new InternalError(err);
  return res.status(internal.status).json(internal.toJSON());
});

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'SkillSwap API listening');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error({ port: PORT, error }, 'Port is already in use. Make sure no other SkillSwap backend instance is running.');
    process.exit(1);
  }
  logger.error({ error }, 'Server failed to start');
  process.exit(1);
});
