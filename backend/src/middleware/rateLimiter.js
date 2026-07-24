import { RateLimitError } from '../utils/errors.js';
import pool from '../config/database.js';

const windowMs = 60 * 1000; // 1 minute
const maxRequests = 60;
const storage = new Map();

function cleanupStore() {
  const now = Date.now();
  for (const [key, entry] of storage.entries()) {
    if (now - entry.firstRequestAt > windowMs * 2) {
      storage.delete(key);
    }
  }
}

setInterval(cleanupStore, windowMs * 2).unref();

export default async function rateLimiter(req, res, next) {
  const key = `${req.ip}:${req.originalUrl}`;
  const now = Date.now();
  let entry = storage.get(key);

  if (!entry || now - entry.firstRequestAt > windowMs) {
    entry = { count: 1, firstRequestAt: now };
    storage.set(key, entry);
  } else {
    entry.count += 1;
  }

  if (entry.count > maxRequests) {
    try {
      await pool.query(
        'INSERT INTO rate_limit_events (ip_address, user_id, endpoint) VALUES ($1, $2, $3)',
        [req.ip, req.user?.uid || null, req.originalUrl],
      );
    } catch (error) {
      console.error('Failed to log rate limit event', error);
    }
    const retrySeconds = Math.ceil((windowMs - (now - entry.firstRequestAt)) / 1000);
    return next(new RateLimitError(retrySeconds));
  }

  next();
}
