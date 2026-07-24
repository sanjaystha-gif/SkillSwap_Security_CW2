import pool from '../config/database.js';
import { z } from 'zod';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const createSkillSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  category: z.string().max(80).optional(),
  is_active: z.boolean().optional(),
});

export async function listSkills(req, res, next) {
  try {
    const result = await pool.query('SELECT id, title, description, category, owner_id, is_active FROM skills WHERE is_active = true');
    res.json({ skills: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getSkill(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, title, description, category, owner_id, is_active FROM skills WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Skill not found');
    res.json({ skill: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function createSkill(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
      createSkillSchema.parse(req.body);
    } catch (e) {
      throw new ValidationError('Invalid skill data', { details: e.errors });
    }

    const { title, description, category } = req.body;
    const result = await pool.query(
      `INSERT INTO skills (title, description, category, owner_id, is_active)
       VALUES ($1, $2, $3, $4, true) RETURNING id, title, description, category, owner_id`,
      [title, description, category || null, req.user.uid],
    );

    res.status(201).json({ skill: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateSkill(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    // Check ownership
    const existing = await pool.query('SELECT owner_id FROM skills WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new NotFoundError('Skill not found');
    if (existing.rows[0].owner_id !== req.user.uid) return res.status(403).json({ message: 'Forbidden' });

    const fields = [];
    const values = [];
    let idx = 1;
    if (req.body.title) { fields.push(`title = $${idx++}`); values.push(req.body.title); }
    if (req.body.description) { fields.push(`description = $${idx++}`); values.push(req.body.description); }
    if (req.body.category !== undefined) { fields.push(`category = $${idx++}`); values.push(req.body.category); }
    if (req.body.is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(req.body.is_active); }

    if (fields.length === 0) return res.json({ message: 'No changes' });

    values.push(id);
    await pool.query(`UPDATE skills SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    res.json({ message: 'Skill updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteSkill(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    const existing = await pool.query('SELECT owner_id FROM skills WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new NotFoundError('Skill not found');
    if (existing.rows[0].owner_id !== req.user.uid) return res.status(403).json({ message: 'Forbidden' });

    await pool.query('DELETE FROM skills WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
