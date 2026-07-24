import pool from '../config/database.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export async function listSwaps(req, res, next) {
  try {
    const q = await pool.query('SELECT id, requester_id, responder_id, skill_id, status, created_at FROM swaps ORDER BY created_at DESC');
    res.json({ swaps: q.rows });
  } catch (err) {
    next(err);
  }
}

export async function createSwap(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { skill_id, responder_id, message } = req.body;
    if (!skill_id || !responder_id) throw new ValidationError('skill_id and responder_id required');

    // create swap in pending state
    const q = await pool.query(
      `INSERT INTO swaps (requester_id, responder_id, skill_id, message, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING id, status, created_at`,
      [req.user.uid, responder_id, skill_id, message || null],
    );

    res.status(201).json({ swap: q.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function respondSwap(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const { action } = req.body; // 'accept'|'reject'
    if (!['accept', 'reject'].includes(action)) throw new ValidationError('Invalid action');

    // ensure swap exists and user is responder
    const s = await pool.query('SELECT id, responder_id, requester_id, status FROM swaps WHERE id = $1', [id]);
    if (s.rows.length === 0) throw new NotFoundError('Swap not found');
    const swap = s.rows[0];
    if (swap.responder_id !== req.user.uid) return res.status(403).json({ message: 'Forbidden' });
    if (swap.status !== 'pending') return res.status(400).json({ message: 'Swap already processed' });

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await pool.query('UPDATE swaps SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, id]);

    res.json({ id, status: newStatus });
  } catch (err) {
    next(err);
  }
}
