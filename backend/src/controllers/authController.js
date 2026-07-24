import { z } from 'zod';
import pool from '../config/database.js';
import { hashPassword, comparePassword, validatePasswordPolicy } from '../utils/password.js';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

// Helper: parse simple cookie header into object
function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((c) => {
      const idx = c.indexOf('=');
      if (idx === -1) return [c.trim(), ''];
      const k = c.slice(0, idx).trim();
      const v = c.slice(idx + 1).trim();
      try {
        return [k, decodeURIComponent(v)];
      } catch (e) {
        return [k, v];
      }
    }),
  );
}

function getRefreshTokenFromReq(req) {
  if (req.body && req.body.refresh_token) return req.body.refresh_token;
  const cookies = parseCookies(req);
  return cookies['refresh_token'];
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  display_name: z.string().min(3).max(60),
  password: z.string().min(12),
  confirm_password: z.string(),
});

/**
 * Register a new user
 * POST /auth/register
 */
export async function registerUser(req, res, next) {
  try {
    const { email, display_name, password, confirm_password } = req.body;

    // Validate input
    try {
      registerSchema.parse(req.body);
    } catch (error) {
      throw new ValidationError('Invalid input', {
        email: error.errors.find((e) => e.path[0] === 'email')?.message,
        display_name: error.errors.find((e) => e.path[0] === 'display_name')?.message,
        password: error.errors.find((e) => e.path[0] === 'password')?.message,
      });
    }

    // Check password confirmation
    if (password !== confirm_password) {
      throw new ValidationError('Passwords do not match', {
        confirm_password: 'Passwords do not match',
      });
    }

    // Validate password policy
    validatePasswordPolicy(password);

    // Check if email already exists (case-insensitive)
    const existingUser = await pool.query('SELECT id FROM users WHERE email = LOWER($1)', [
      email,
    ]);

    if (existingUser.rows.length > 0) {
      throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name, email_verified)
       VALUES (LOWER($1), $2, $3, false)
       RETURNING id, email, display_name`,
      [email, passwordHash, display_name],
    );

    const user = result.rows[0];

    // Create profile
    await pool.query(
      'INSERT INTO profiles (user_id, is_public) VALUES ($1, true)',
      [user.id],
    );

    res.status(201).json({
      user_id: user.id,
      message: 'Registration successful. Please verify your email.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify email token
 * POST /auth/verify-email
 */
export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    // TODO: Implement email verification token logic
    // For now, accept any token and mark email as verified
    res.json({
      verified: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login - Step 1: Validate credentials
 * POST /auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Query user (never reveal if email exists)
    const result = await pool.query('SELECT * FROM users WHERE email = LOWER($1)', [email]);

    if (result.rows.length === 0) {
      // Generic response - don't leak that email doesn't exist
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new UnauthorizedError(
        `Account is locked. Try again at ${new Date(user.locked_until).toISOString()}`,
      );
    }

    // Check if account is active
    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed login attempts
      const failedCount = (user.failed_login_count || 0) + 1;

      // Lock account after 5 failed attempts
      if (failedCount >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await pool.query('UPDATE users SET failed_login_count = $1, locked_until = $2 WHERE id = $3', [
          failedCount,
          lockUntil,
          user.id,
        ]);
      } else {
        await pool.query('UPDATE users SET failed_login_count = $1 WHERE id = $2', [
          failedCount,
          user.id,
        ]);
      }

      // Generic response
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset failed attempts
    await pool.query('UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = $1', [
      user.id,
    ]);

    // Check if MFA is enabled
    if (user.mfa_enabled) {
      // Generate MFA challenge (TODO: implement with Redis)
      res.json({
        mfa_required: true,
        challenge_id: 'temp-challenge-id',
      });
    } else {
      // Create a server-side session and issue tokens
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const userAgent = req.get('User-Agent') || null;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;

      const sessionInsert = await pool.query(
        `INSERT INTO sessions (user_id, user_agent, ip_address, expires_at)
         VALUES ($1, $2, $3, $4) RETURNING id, expires_at`,
        [user.id, userAgent, ipAddress, expiresAt.toISOString()],
      );

      const session = sessionInsert.rows[0];

      const accessToken = signAccessToken({ sub: user.id, uid: user.id });
      const refreshToken = signRefreshToken({ sid: session.id, uid: user.id });

      // Set HTTP-only refresh cookie (scoped to auth routes)
      const secure = process.env.NODE_ENV === 'production';
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/api/v1/auth/refresh',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        access_token: accessToken,
        expires_at: session.expires_at,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Login - Step 2: MFA verification
 * POST /auth/login/mfa
 */
export async function verifyMFA(req, res, next) {
  try {
    const { challenge_id, totp_code } = req.body;

    if (!challenge_id || !totp_code) {
      throw new ValidationError('Challenge ID and TOTP code are required');
    }

    // TODO: Verify MFA code
    // On successful MFA verification, create session and issue tokens similar to login
    // (This placeholder continues to return TODO tokens until MFA is implemented)
    res.json({
      access_token: 'temp-access-token',
      refresh_token: 'temp-refresh-token',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout
 * POST /auth/logout
 */
export async function logout(req, res, next) {
  try {
    const token = getRefreshTokenFromReq(req);
    if (!token) {
      // still clear cookie on client
      const secure = process.env.NODE_ENV === 'production';
      res.clearCookie('refresh_token', { httpOnly: true, secure, path: '/api/v1/auth/refresh', sameSite: 'lax' });
      return res.status(204).send();
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (e) {
      // invalid token — clear cookie and return
      const secure = process.env.NODE_ENV === 'production';
      res.clearCookie('refresh_token', { httpOnly: true, secure, path: '/api/v1/auth/refresh', sameSite: 'lax' });
      return res.status(204).send();
    }

    const sid = payload?.sid;
    if (sid) {
      await pool.query('UPDATE sessions SET revoked = true, updated_at = NOW() WHERE id = $1', [sid]);
    }

    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie('refresh_token', { httpOnly: true, secure, path: '/api/v1/auth/refresh', sameSite: 'lax' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh token
 * POST /auth/refresh
 */
export async function refreshToken(req, res, next) {
  try {
    const token = getRefreshTokenFromReq(req);
    if (!token) throw new ValidationError('Refresh token is required');

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const sid = payload?.sid;
    if (!sid) throw new UnauthorizedError('Invalid refresh token (missing session)');

    // Verify session exists, not revoked, and not expired
    const sessionRes = await pool.query('SELECT id, user_id, revoked, expires_at FROM sessions WHERE id = $1', [sid]);
    if (sessionRes.rows.length === 0) throw new UnauthorizedError('Session not found');

    const session = sessionRes.rows[0];
    if (session.revoked) throw new UnauthorizedError('Session revoked');
    if (new Date(session.expires_at) < new Date()) throw new UnauthorizedError('Session expired');

    // Rotate: create a new session and revoke the old one
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const userAgent = req.get('User-Agent') || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;

    const newSessionRes = await pool.query(
      `INSERT INTO sessions (user_id, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING id, expires_at`,
      [session.user_id, userAgent, ipAddress, expiresAt.toISOString()],
    );

    const newSession = newSessionRes.rows[0];

    // Revoke old session
    await pool.query('UPDATE sessions SET revoked = true, updated_at = NOW() WHERE id = $1', [session.id]);

    const accessToken = signAccessToken({ sub: session.user_id, uid: session.user_id });
    const refreshToken = signRefreshToken({ sid: newSession.id, uid: session.user_id });

    // Set HTTP-only cookie for rotated refresh token
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      access_token: accessToken,
      expires_at: newSession.expires_at,
    });
  } catch (error) {
    next(error);
  }
}
