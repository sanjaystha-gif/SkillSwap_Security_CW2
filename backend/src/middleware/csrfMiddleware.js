import crypto from 'crypto';
import { ForbiddenError } from '../utils/errors.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

function getAllowedOrigins() {
  return (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin) {
  if (!origin) return true;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

function safeEquals(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

export default function csrfMiddleware(req, res, next) {
  if (!MUTATING_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get('Origin') || req.get('origin') || null;
  if (!isOriginAllowed(origin)) {
    return next(new ForbiddenError('Invalid request origin'));
  }

  const fetchSite = req.get('Sec-Fetch-Site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site') {
    return next(new ForbiddenError('Invalid request source'));
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const csrfHeader = req.get(CSRF_HEADER_NAME) || req.get(CSRF_HEADER_NAME.toUpperCase());

  if (!csrfCookie || !csrfHeader) {
    return next(new ForbiddenError('Missing CSRF token'));
  }

  if (!safeEquals(csrfCookie, csrfHeader)) {
    return next(new ForbiddenError('Invalid CSRF token'));
  }

  return next();
}
