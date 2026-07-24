import pool from '../config/database.js';

export async function logAudit({ actor_id = null, actor_role = null, action, resource_type = null, resource_id = null, ip_address = null, details = {} }) {
  await pool.query(
    `INSERT INTO audit_log (actor_id, actor_role, action, resource_type, resource_id, ip_address, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [actor_id, actor_role, action, resource_type, resource_id, ip_address, details],
  );
}
