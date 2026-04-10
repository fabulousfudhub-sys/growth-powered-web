const { pool } = require('../db/pool');

async function logAudit({ userId, userName, role, action, category, details, ip }) {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, user_name, role, action, category, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId || null, userName || 'System', role || 'system', action, category, details || '', ip || '']
    );
  } catch (err) {
    console.error('[AUDIT] Failed to log:', err.message);
  }
}

module.exports = { logAudit };
