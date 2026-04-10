const { pool } = require('../db/pool');

// Cache system lock status for 10 seconds to reduce DB hits
let cachedStatus = null;
let cacheTime = 0;
const CACHE_TTL = 10000;

async function getSystemStatus() {
  const now = Date.now();
  if (cachedStatus && (now - cacheTime) < CACHE_TTL) return cachedStatus;
  try {
    const { rows } = await pool.query(`SELECT settings FROM site_settings WHERE id = 1`);
    const settings = rows.length > 0 ? rows[0].settings : {};
    cachedStatus = {
      locked: settings.systemLocked || false,
      deactivated: settings.systemDeactivated || false,
    };
    cacheTime = now;
    return cachedStatus;
  } catch {
    return { locked: false, deactivated: false };
  }
}

// Middleware: reject mutating requests when system is locked (except for super_admin)
function enforceSystemLock(req, res, next) {
  // Only block mutating methods
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

  // Allow unauthenticated requests to pass (auth middleware will catch them)
  if (!req.user) return next();

  // Super admins bypass lock
  if (req.user.role === 'super_admin') return next();

  getSystemStatus().then(status => {
    if (status.deactivated) {
      return res.status(503).json({ error: 'System is deactivated. Contact Super Admin.' });
    }
    if (status.locked) {
      return res.status(423).json({ error: 'System is locked. Create/edit operations are disabled.' });
    }
    next();
  }).catch(() => next());
}

// Reset cache (called when settings change)
function resetSystemLockCache() {
  cachedStatus = null;
  cacheTime = 0;
}

module.exports = { enforceSystemLock, resetSystemLockCache, getSystemStatus };
