import pool from '../config/database.js';
import { z } from 'zod';
import { logAudit } from '../utils/audit.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

const updateStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'banned', 'deleted']),
});

const updateRoleSchema = z.object({
  role: z.enum(['member', 'moderator', 'admin']),
});

export async function listUsers(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, role, status, created_at FROM users ORDER BY created_at DESC',
    );
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const params = updateStatusSchema.parse(req.body);
    const { id } = req.params;

    const result = await pool.query('UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status', [
      params.status,
      id,
    ]);

    if (result.rows.length === 0) throw new NotFoundError('User not found');

    await logAudit({
      actor_id: req.user.uid,
      actor_role: req.user.role,
      action: 'admin.user.status_update',
      resource_type: 'user',
      resource_id: id,
      ip_address: req.ip,
      details: { status: params.status },
    });

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const params = updateRoleSchema.parse(req.body);
    const { id } = req.params;

    const result = await pool.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, role', [
      params.role,
      id,
    ]);

    if (result.rows.length === 0) throw new NotFoundError('User not found');

    await logAudit({
      actor_id: req.user.uid,
      actor_role: req.user.role,
      action: 'admin.user.role_update',
      resource_type: 'user',
      resource_id: id,
      ip_address: req.ip,
      details: { role: params.role },
    });

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLog(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT id, actor_id, actor_role, action, resource_type, resource_id, ip_address, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT 200',
    );
    res.json({ audit_log: result.rows });
  } catch (err) {
    next(err);
  }
}
