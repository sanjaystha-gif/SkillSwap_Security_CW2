import pool from '../config/database.js';
import { ValidationError } from '../utils/errors.js';

export async function getBalance(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const q = await pool.query('SELECT SUM(amount) as balance FROM credit_ledger WHERE user_id = $1', [userId]);
    const balance = Number(q.rows[0].balance) || 0;
    res.json({ user_id: userId, balance });
  } catch (err) {
    next(err);
  }
}

export async function addCredit(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const userId = req.user.uid;
    const { amount, reason } = req.body;
    if (typeof amount !== 'number' || amount === 0) throw new ValidationError('Invalid amount');

    await pool.query(
      'INSERT INTO credit_ledger (user_id, change_type, amount, metadata) VALUES ($1, $2, $3, $4)',
      [userId, 'credit', amount, JSON.stringify({ reason: reason || null })],
    );

    res.status(201).json({ message: 'Credit added' });
  } catch (err) {
    next(err);
  }
}
