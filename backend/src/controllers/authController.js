import { z } from 'zod';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import pool from '../config/database.js';
import { hashPassword, comparePassword, validatePasswordPolicy } from '../utils/password.js';
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
} from '../utils/errors.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { logAudit } from '../utils/audit.js';
import { sendDirectEmail } from '../services/notificationService.js';

const MFA_ISSUER = process.env.MFA_ISSUER || 'SkillSwap';
const MFA_CHALLENGE_EXPIRES_MS = 5 * 60 * 1000;
const EMAIL_VERIFICATION_EXPIRES_MS = 30 * 60 * 1000;

// Helper: hash refresh token for storage
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createEmailVerificationToken() {
  return crypto.randomBytes(48).toString('hex');
}

function encryptSecret(secret) {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string');
  }

  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decryptSecret(payload) {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string');
  }

  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const key = Buffer.from(keyHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

function createMfaChallengeToken(user) {
  const payload = {
    uid: user.id,
    email: user.email,
    purpose: 'mfa_login',
    mfa_exp: Date.now() + MFA_CHALLENGE_EXPIRES_MS,
  };

  return signRefreshToken(payload);
}

function verifyMfaChallengeToken(token) {
  const payload = verifyRefreshToken(token);
  if (payload?.purpose !== 'mfa_login' || !payload?.uid) {
    throw new UnauthorizedError('Invalid MFA challenge');
  }
  if (!payload?.mfa_exp || Date.now() > Number(payload.mfa_exp)) {
    throw new UnauthorizedError('MFA challenge expired');
  }
  return payload;
}

function normalizeBackupCode(code) {
  return String(code || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function formatBackupCode(rawCode) {
  const normalized = normalizeBackupCode(rawCode);
  if (normalized.length <= 4) return normalized;
  return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
}

async function consumeBackupCode(userId, code) {
  const normalizedCode = normalizeBackupCode(code);
  if (!normalizedCode) return false;

  await pool.query('BEGIN');
  try {
    const codesResult = await pool.query(
      'SELECT id, code_hash FROM mfa_backup_codes WHERE user_id = $1 AND used_at IS NULL FOR UPDATE',
      [userId],
    );

    let matchedCodeId = null;
    for (const row of codesResult.rows) {
      const matches = await comparePassword(normalizedCode, row.code_hash);
      if (matches) {
        matchedCodeId = row.id;
        break;
      }
    }

    if (!matchedCodeId) {
      await pool.query('ROLLBACK');
      return false;
    }

    const updateResult = await pool.query(
      'UPDATE mfa_backup_codes SET used_at = NOW() WHERE id = $1 AND used_at IS NULL RETURNING id',
      [matchedCodeId],
    );

    if (updateResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return false;
    }

    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

function buildMfaProvisioning(user, secret) {
  return authenticator.keyuri(user.email, MFA_ISSUER, secret);
}

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

function getRefreshCookieOptions() {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/api',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

function getRefreshCookieClearOptions() {
  const secure = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/api',
  };
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  display_name: z.string().min(3).max(60),
  password: z.string().min(12),
  confirm_password: z.string(),
});

const verifyEmailSchema = z.object({
  token: z.string().min(32),
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

    const verificationToken = createEmailVerificationToken();
    const verificationTokenHash = hashRefreshToken(verificationToken);
    const verificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_MS).toISOString();

    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, verificationTokenHash, verificationExpiresAt],
    );

    const frontendBaseUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
    const verifyLink = `${frontendBaseUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(verificationToken)}`;

    const emailSubject = 'Verify your SkillSwap email';
    const emailBody = [
      `Hi ${user.display_name},`,
      '',
      'Welcome to SkillSwap. Please verify your email to finish setting up your account.',
      '',
      `Verify now: ${verifyLink}`,
      '',
      'This link expires in 30 minutes. If you did not create this account, you can ignore this email.',
    ].join('\n');

    const emailResult = await sendDirectEmail(user.email, emailSubject, emailBody);

    await logAudit({
      actor_id: user.id,
      actor_role: 'user',
      action: 'user.register',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: req.ip,
      details: { email: user.email },
    });

    const payload = {
      user_id: user.id,
      message: 'Registration successful. Please verify your email.',
    };

    // Keep developer fallback to unblock testing when SMTP is unavailable.
    if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
      payload['verification_token'] = verificationToken;
      payload['verification_link'] = verifyLink;
      payload['email_debug_reason'] = emailResult.reason;
    }

    res.status(201).json(payload);
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
    let token;
    try {
      ({ token } = verifyEmailSchema.parse(req.body));
    } catch (error) {
      throw new ValidationError('Verification token is required');
    }

    const tokenHash = hashRefreshToken(String(token).trim());
    const tokenResult = await pool.query(
      `SELECT id, user_id, used_at, expires_at
       FROM email_verification_tokens
       WHERE token_hash = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [tokenHash],
    );

    if (tokenResult.rows.length === 0) {
      throw new ValidationError('Invalid verification token');
    }

    const verification = tokenResult.rows[0];
    if (verification.used_at) {
      throw new ValidationError('Verification token has already been used');
    }

    if (new Date(verification.expires_at) < new Date()) {
      return res.status(410).json({
        error: {
          code: 'VERIFICATION_TOKEN_EXPIRED',
          message: 'Verification token has expired',
          status: 410,
          details: {},
        },
      });
    }

    await pool.query('BEGIN');
    try {
      const consumed = await pool.query(
        'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1 AND used_at IS NULL RETURNING user_id',
        [verification.id],
      );

      if (consumed.rows.length === 0) {
        await pool.query('ROLLBACK');
        throw new ValidationError('Verification token has already been used');
      }

      await pool.query('UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1', [
        verification.user_id,
      ]);

      // Retire all other outstanding verification tokens for this user.
      await pool.query(
        'UPDATE email_verification_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL AND id <> $2',
        [verification.user_id, verification.id],
      );

      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

    await logAudit({
      actor_id: verification.user_id,
      actor_role: 'user',
      action: 'user.email_verified',
      resource_type: 'user',
      resource_id: verification.user_id,
      ip_address: req.ip,
      details: {},
    });

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
      const challengeToken = createMfaChallengeToken(user);
      res.json({
        mfa_required: true,
        challenge_token: challengeToken,
      });
    } else {
      // Create a server-side session and issue tokens
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const userAgent = req.get('User-Agent') || null;
      const userAgentHash = userAgent ? crypto.createHash('sha256').update(userAgent).digest('hex') : null;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;

      const accessToken = signAccessToken({ sub: user.id, uid: user.id, role: user.role });
      const refreshToken = signRefreshToken({ sid: 'temp', uid: user.id });
      const refreshTokenHash = hashRefreshToken(refreshToken);

      const sessionInsert = await pool.query(
        `INSERT INTO sessions (user_id, refresh_token_hash, user_agent_hash, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, expires_at`,
        [user.id, refreshTokenHash, userAgentHash, ipAddress, expiresAt.toISOString()],
      );

      const session = sessionInsert.rows[0];

      // Re-sign refresh token with actual session ID
      const refreshTokenFinal = signRefreshToken({ sid: session.id, uid: user.id });

      await logAudit({
        actor_id: user.id,
        actor_role: user.role,
        action: 'user.login',
        resource_type: 'session',
        resource_id: session.id,
        ip_address: req.ip,
        details: { method: 'password' },
      });

      // Set HTTP-only refresh cookie scoped to API endpoints
      res.cookie('refresh_token', refreshTokenFinal, getRefreshCookieOptions());

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
    const { challenge_token, code, totp_code } = req.body;
    const mfaCode = String(code || totp_code || '').trim();

    if (!challenge_token || !mfaCode) {
      throw new ValidationError('Challenge token and TOTP code are required');
    }

    const payload = verifyMfaChallengeToken(challenge_token);
    const result = await pool.query(
      'SELECT id, email, role, status, mfa_enabled, mfa_secret_enc FROM users WHERE id = $1',
      [payload.uid],
    );
    if (result.rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    const user = result.rows[0];
    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }
    if (!user.mfa_enabled || !user.mfa_secret_enc) {
      throw new UnauthorizedError('MFA is not enabled for this account');
    }

    const secret = decryptSecret(user.mfa_secret_enc);
    const isTotpValid = authenticator.check(mfaCode, secret);

    let authMethod = 'totp';
    if (!isTotpValid) {
      const usedBackupCode = await consumeBackupCode(user.id, mfaCode);
      if (!usedBackupCode) {
        throw new UnauthorizedError('Invalid verification code');
      }
      authMethod = 'backup_code';
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const userAgent = req.get('User-Agent') || null;
    const userAgentHash = userAgent ? crypto.createHash('sha256').update(userAgent).digest('hex') : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;

    const accessToken = signAccessToken({ sub: user.id, uid: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sid: 'temp', uid: user.id });
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const sessionInsert = await pool.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, user_agent_hash, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, expires_at`,
      [user.id, refreshTokenHash, userAgentHash, ipAddress, expiresAt.toISOString()],
    );

    const session = sessionInsert.rows[0];
    const refreshTokenFinal = signRefreshToken({ sid: session.id, uid: user.id });

    await logAudit({
      actor_id: user.id,
      actor_role: user.role,
      action: 'user.login.mfa',
      resource_type: 'session',
      resource_id: session.id,
      ip_address: req.ip,
      details: { method: authMethod },
    });

    res.cookie('refresh_token', refreshTokenFinal, getRefreshCookieOptions());

    res.json({ access_token: accessToken, expires_at: session.expires_at });
  } catch (error) {
    next(error);
  }
}

export async function setupMFA(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const userResult = await pool.query('SELECT id, email, mfa_enabled FROM users WHERE id = $1', [req.user.uid]);
    if (userResult.rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    const user = userResult.rows[0];
    if (user.mfa_enabled) {
      return res.status(400).json({ message: 'MFA is already enabled' });
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = buildMfaProvisioning(user, secret);

    res.json({
      secret,
      otpauth_url: otpauthUrl,
      issuer: MFA_ISSUER,
      account: user.email,
    });
  } catch (error) {
    next(error);
  }
}

export async function enableMFA(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { secret, code } = req.body;
    if (!secret || !code) {
      throw new ValidationError('Secret and verification code are required');
    }

    const normalizedSecret = String(secret).trim().replace(/\s+/g, '').toUpperCase();
    const verified = authenticator.check(String(code).trim(), normalizedSecret);
    if (!verified) {
      throw new UnauthorizedError('Invalid verification code');
    }

    const encrypted = encryptSecret(normalizedSecret);
    await pool.query(
      'UPDATE users SET mfa_enabled = true, mfa_secret_enc = $1, updated_at = NOW() WHERE id = $2',
      [encrypted, req.user.uid],
    );

    const backupCodes = Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
    for (const backupCode of backupCodes) {
      const hash = await hashPassword(normalizeBackupCode(backupCode));
      await pool.query(
        'INSERT INTO mfa_backup_codes (user_id, code_hash) VALUES ($1, $2)',
        [req.user.uid, hash],
      );
    }

    await logAudit({
      actor_id: req.user.uid,
      actor_role: req.user.role,
      action: 'user.mfa.enabled',
      resource_type: 'user',
      resource_id: req.user.uid,
      ip_address: req.ip,
      details: {},
    });

    res.json({
      message: 'MFA enabled',
      backup_codes: backupCodes.map((backupCode) => formatBackupCode(backupCode)),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Issue CSRF token for double-submit protection
 * GET /auth/csrf-token
 */
export async function issueCsrfToken(req, res, next) {
  try {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite: 'lax',
      path: '/api',
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({ csrf_token: csrfToken });
  } catch (error) {
    next(error);
  }
}

export async function disableMFA(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    await pool.query(
      'UPDATE users SET mfa_enabled = false, mfa_secret_enc = NULL, updated_at = NOW() WHERE id = $1',
      [req.user.uid],
    );
    await pool.query('DELETE FROM mfa_backup_codes WHERE user_id = $1', [req.user.uid]);

    await logAudit({
      actor_id: req.user.uid,
      actor_role: req.user.role,
      action: 'user.mfa.disabled',
      resource_type: 'user',
      resource_id: req.user.uid,
      ip_address: req.ip,
      details: {},
    });

    res.json({ message: 'MFA disabled' });
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
      res.clearCookie('refresh_token', getRefreshCookieClearOptions());
      return res.status(204).send();
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (e) {
      // invalid token — clear cookie and return
      res.clearCookie('refresh_token', getRefreshCookieClearOptions());
      return res.status(204).send();
    }

    const sid = payload?.sid;
    if (sid) {
      await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE id = $1', [sid]);
      await logAudit({
        actor_id: payload?.uid || null,
        actor_role: 'user',
        action: 'user.logout',
        resource_type: 'session',
        resource_id: sid,
        ip_address: req.ip,
      });
    }

    res.clearCookie('refresh_token', getRefreshCookieClearOptions());
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
    const sessionRes = await pool.query('SELECT id, user_id, revoked_at, expires_at FROM sessions WHERE id = $1', [sid]);
    if (sessionRes.rows.length === 0) throw new UnauthorizedError('Session not found');

    const session = sessionRes.rows[0];
    if (session.revoked_at) throw new UnauthorizedError('Session revoked');
    if (new Date(session.expires_at) < new Date()) throw new UnauthorizedError('Session expired');

    // Rotate: create a new session and revoke the old one
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const userAgent = req.get('User-Agent') || null;
    const userAgentHash = userAgent ? crypto.createHash('sha256').update(userAgent).digest('hex') : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;

    const profile = await pool.query('SELECT role FROM users WHERE id = $1', [session.user_id]);
    const role = profile.rows[0]?.role || 'member';

    const newAccessToken = signAccessToken({ sub: session.user_id, uid: session.user_id, role });

    const newRefreshToken = signRefreshToken({ sid: 'temp', uid: session.user_id });
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const newSessionRes = await pool.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, user_agent_hash, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, expires_at`,
      [session.user_id, newRefreshTokenHash, userAgentHash, ipAddress, expiresAt.toISOString()],
    );

    const newSession = newSessionRes.rows[0];

    // Re-sign refresh token with actual session ID
    const newRefreshTokenFinal = signRefreshToken({ sid: newSession.id, uid: session.user_id });

    // Revoke old session
    await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE id = $1', [session.id]);

    await logAudit({
      actor_id: session.user_id,
      actor_role: role,
      action: 'token.refresh',
      resource_type: 'session',
      resource_id: newSession.id,
      ip_address: req.ip,
    });

    // Set HTTP-only cookie for rotated refresh token scoped to API endpoints
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('refresh_token', newRefreshTokenFinal, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/api',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      access_token: newAccessToken,
      expires_at: newSession.expires_at,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Forgot password - send reset link
 * POST /auth/forgot-password
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const result = await pool.query('SELECT id, email FROM users WHERE email = LOWER($1)', [email]);
    if (result.rows.length === 0) {
      // Don't reveal whether the email exists
      return res.json({ message: 'If an account exists, you will receive a reset link shortly.' });
    }

    const user = result.rows[0];

    // Create a server-side session for the password reset and issue a token tied to it
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const sessionInsert = await pool.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, user_agent_hash, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, expires_at`,
      [user.id, '', null, req.ip || null, expiresAt.toISOString()],
    );
    const session = sessionInsert.rows[0];

    // Sign a token that includes the session id so we can validate it later
    const resetToken = signRefreshToken({ sid: session.id, uid: user.id, purpose: 'pwd_reset' });
    const resetTokenHash = hashRefreshToken(resetToken);

    // Save the actual token hash for later validation
    await pool.query('UPDATE sessions SET refresh_token_hash = $1 WHERE id = $2', [resetTokenHash, session.id]);

    await logAudit({
      actor_id: user.id,
      actor_role: 'user',
      action: 'user.password_reset_requested',
      resource_type: 'user',
      resource_id: user.id,
      ip_address: req.ip,
    });

    const frontendBaseUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
    const resetLink = `${frontendBaseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(resetToken)}`;

    const emailSubject = 'SkillSwap password reset request';
    const emailBody = [
      'We received a request to reset your SkillSwap password.',
      '',
      `Reset your password using this link: ${resetLink}`,
      '',
      'This link expires in 1 hour. If you did not request this, you can ignore this email.',
    ].join('\n');

    const emailResult = await sendDirectEmail(user.email, emailSubject, emailBody);

    const payload = {
      message: 'If an account exists, you will receive a reset link shortly.',
    };

    // Keep developer fallback to unblock testing when SMTP is not configured.
    if (!emailResult.sent && process.env.NODE_ENV !== 'production') {
      payload['token'] = resetToken;
      payload['email_debug_reason'] = emailResult.reason;
      payload['reset_link'] = resetLink;
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
}

/**
 * Reset password - consume token and set new password
 * POST /auth/reset-password
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (payload.purpose !== 'pwd_reset' || !payload.uid || !payload.sid) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Verify session exists and is not revoked/expired
    const sessionRes = await pool.query('SELECT id, refresh_token_hash, revoked_at, expires_at FROM sessions WHERE id = $1', [payload.sid]);
    if (sessionRes.rows.length === 0) return res.status(400).json({ message: 'Invalid token (session)' });
    const sessionRow = sessionRes.rows[0];
    if (sessionRow.revoked_at) return res.status(400).json({ message: 'Token revoked' });
    if (new Date(sessionRow.expires_at) < new Date()) return res.status(400).json({ message: 'Token expired' });

    const tokenHash = hashRefreshToken(token);
    if (sessionRow.refresh_token_hash !== tokenHash) return res.status(400).json({ message: 'Invalid token' });

    // Revoke the session after use
    await pool.query('UPDATE sessions SET revoked_at = NOW() WHERE id = $1', [payload.sid]);

    // Validate password policy
    validatePasswordPolicy(password);

    const passwordHash = await hashPassword(password);
    await pool.query('UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2', [passwordHash, payload.uid]);

    await logAudit({
      actor_id: payload.uid,
      actor_role: 'user',
      action: 'user.password_reset',
      resource_type: 'user',
      resource_id: payload.uid,
      ip_address: req.ip,
    });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}
