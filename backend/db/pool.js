const { Pool } = require('pg');

// ── Dual DB support ──
// If DB_HOST points to Supabase (or any remote), use SSL.
// If DB_HOST is localhost/127.0.0.1, it's a local PostgreSQL.
// Both are standard PostgreSQL — no code difference needed.

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_NAME = process.env.DB_NAME || 'atapoly_cbt';
const DB_USER = process.env.DB_USER || 'cbt_admin';
const DB_PASSWORD = process.env.DB_PASSWORD || 'cbt_password';

// Auto-detect SSL: enable for non-local hosts unless explicitly disabled
const isLocal = ['localhost', '127.0.0.1', '::1'].includes(DB_HOST);
const DB_SSL = process.env.DB_SSL === 'true' || (!isLocal && process.env.DB_SSL !== 'false');

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: DB_SSL ? { rejectUnauthorized: false } : false,
  max: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: false,
});

pool.on('error', (err) => {
  console.error('[DB POOL ERROR]', err.message);
});

async function testConnection() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW()');
      const dbType = isLocal ? 'Local PostgreSQL' : 'Remote PostgreSQL (Supabase)';
      console.log(`✅ Database connected [${dbType}] @ ${DB_HOST}:${DB_PORT}/${DB_NAME}:`, res.rows[0].now);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`❌ Database connection failed @ ${DB_HOST}:${DB_PORT}/${DB_NAME}:`, err.message);
    throw err;
  }
}

// Expose config info for the settings API
function getDbInfo() {
  return {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    ssl: DB_SSL,
    isLocal,
    type: isLocal ? 'local' : 'remote',
  };
}

module.exports = { pool, testConnection, getDbInfo };
