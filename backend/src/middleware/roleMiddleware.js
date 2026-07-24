import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export function requireRole(...roles) {
  return function requireRoleHandler(req, res, next) {
    if (!req.user) {
      return next(new UnauthorizedError('Unauthorized'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient privileges'));
    }

    return next();
  };
}
