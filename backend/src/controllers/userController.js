import pool from '../config/database.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { z } from 'zod';

const updateProfileSchema = z.object({
  display_name: z.string().min(3).max(60).optional(),
  bio: z.string().max(500).optional(),
  is_public: z.boolean().optional(),
});

export async function getProfile(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.email, u.display_name, p.bio, p.is_public, p.created_at
       FROM users u JOIN profiles p ON p.user_id = u.id WHERE u.id = $1`,
      [id],
    );

    if (result.rows.length === 0) throw new NotFoundError('User not found');

    const profile = result.rows[0];
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body;

    try {
      updateProfileSchema.parse(body);
    } catch (e) {
      throw new ValidationError('Invalid profile data', { details: e.errors });
    }

    // Only allow users to update their own profile — assume `req.user` is set by auth middleware
    if (!req.user || req.user.uid !== Number(id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (body.display_name) {
      fields.push(`display_name = $${idx++}`);
      values.push(body.display_name);
    }
    if (body.bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(body.bio);
    }
    if (body.is_public !== undefined) {
      fields.push(`is_public = $${idx++}`);
      values.push(body.is_public);
    }

    if (fields.length === 0) return res.json({ message: 'No changes' });

    // Update users.display_name separately from profiles
    const updates = [];
    const params = [];
    let pIdx = 1;

    if (body.display_name) {
      await pool.query('UPDATE users SET display_name = $1 WHERE id = $2', [body.display_name, id]);
    }

    if (body.bio !== undefined || body.is_public !== undefined) {
      const setParts = [];
      if (body.bio !== undefined) {
        setParts.push(`bio = $${pIdx++}`);
        params.push(body.bio);
      }
      if (body.is_public !== undefined) {
        setParts.push(`is_public = $${pIdx++}`);
        params.push(body.is_public);
      }
      params.push(id);
      await pool.query(`UPDATE profiles SET ${setParts.join(', ')} WHERE user_id = $${pIdx}`, params);
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
}
