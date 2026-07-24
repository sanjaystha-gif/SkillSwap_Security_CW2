import bcrypt from 'bcryptjs';
import zxcvbn from 'zxcvbn';
import { ValidationError } from './errors.js';

// Password strength requirements
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_STRENGTH_THRESHOLD = 2; // zxcvbn score 2 or higher

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Validate password against policy
 */
export function validatePasswordPolicy(password) {
  // Must be 12+ characters
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new ValidationError('Password must be at least 12 characters long');
  }

  // Check strength using zxcvbn
  const result = zxcvbn(password);
  if (result.score < PASSWORD_STRENGTH_THRESHOLD) {
    throw new ValidationError('Password is too weak', {
      password: `Password must be stronger. ${result.feedback.suggestions.join(' ')}`,
    });
  }

  return true;
}

/**
 * Generate password strength feedback
 */
export function getPasswordStrengthFeedback(password) {
  const result = zxcvbn(password);
  return {
    score: result.score,
    feedback: result.feedback.suggestions,
    warning: result.feedback.warning,
  };
}
