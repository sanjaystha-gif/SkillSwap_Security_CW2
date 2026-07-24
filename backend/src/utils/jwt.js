import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '30d';

const useRS = Boolean(process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY);

function getPrivateKey() {
  if (useRS) return process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
  return process.env.JWT_SECRET;
}

function getPublicKey() {
  if (useRS) return process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
  return process.env.JWT_SECRET;
}

export function signAccessToken(payload) {
  return jwt.sign(payload, getPrivateKey(), {
    algorithm: useRS ? 'RS256' : 'HS256',
    expiresIn: ACCESS_EXPIRES,
  });
}

export function signRefreshToken(payload) {
  // Refresh tokens may be rotated; keep longer expiry
  return jwt.sign(payload, getPrivateKey(), {
    algorithm: useRS ? 'RS256' : 'HS256',
    expiresIn: REFRESH_EXPIRES,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, getPublicKey());
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, getPublicKey());
}

export function generateRandomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}
