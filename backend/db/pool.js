const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'atapoly_cbt',
  user: process.env.DB_USER || 'cbt_admin',
  password: process.env.DB_PASSWORD || 'cbt_password',
  // Tuned for 1000 concurrent exam clients
  max: 100,               // max pool connections (PostgreSQL default max_connections=100)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: false,
});

pool.on('error', (err) => {
  console.error('[DB POOL ERROR]', err.message);
});

async function testConnection() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW()');
    console.log('✅ Database connected:', res.rows[0].now);
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
