import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export default function authMiddleware(req, res, next) {
  const authHeader = req.get('Authorization') || req.headers.authorization || '';
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7).trim();
  try {
    const payload = verifyAccessToken(token);
    // Attach the token payload to req.user for downstream handlers
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid or expired access token'));
  }
}
