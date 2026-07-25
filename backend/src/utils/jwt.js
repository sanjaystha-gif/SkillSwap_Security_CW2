import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '30d';

const useRS = Boolean(process.env.JWT_PRIVATE_KEY && process.env.JWT_PUBLIC_KEY);

function parseKey(value) {
  if (!value) return undefined;

  let key = value;

  // Some environments store PEM keys as base64 content rather than raw multiline text.
  // Detect that form and decode it to a proper PEM string.
  if (/^LS0tLS[\w\d+/=\r\n]+$/.test(key)) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        key = decoded;
      }
    } catch {
      // Keep the original value if decode fails.
    }
  }

  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  return key;
}

function getPrivateKey() {
  if (useRS) return parseKey(process.env.JWT_PRIVATE_KEY);
  return process.env.JWT_SECRET;
}

function getPublicKey() {
  if (useRS) return parseKey(process.env.JWT_PUBLIC_KEY);
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
