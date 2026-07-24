import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import pool from '../config/database.js';

export default async function authMiddleware(req, res, next) {
  const authHeader = req.get('Authorization') || req.headers.authorization || '';
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7).trim();
  try {
    const payload = verifyAccessToken(token);
    const userId = payload?.uid || payload?.sub;
    if (!userId) {
      throw new Error('Token missing user identifier');
    }

    const result = await pool.query('SELECT id, role, status, email FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return next(new UnauthorizedError('User not found'));
    }

    const user = result.rows[0];
    if (user.status !== 'active') {
      return next(new UnauthorizedError('User account is not active'));
    }

    req.user = {
      uid: user.id,
      role: user.role,
      email: user.email,
    };
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired access token'));
  }
}
