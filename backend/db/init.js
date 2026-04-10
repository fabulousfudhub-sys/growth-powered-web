const { readFileSync } = require('fs');
const { join } = require('path');
const { Pool } = require('pg');

async function init() {
  // First connect to default 'postgres' db to create our database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres',
    user: process.env.DB_USER || 'cbt_admin',
    password: process.env.DB_PASSWORD || 'cbt_password',
  });

  const dbName = process.env.DB_NAME || 'atapoly_cbt';

  try {
    const exists = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
    );
    if (exists.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`ℹ️  Database "${dbName}" already exists`);
    }
  } finally {
    await adminPool.end();
  }

  // Now connect to our database and run schema
  const appPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: dbName,
    user: process.env.DB_USER || 'cbt_admin',
    password: process.env.DB_PASSWORD || 'cbt_password',
  });

  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await appPool.query(schema);
    console.log('✅ Schema applied successfully');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Schema already exists (skipping)');
    } else {
      throw err;
    }
  } finally {
    await appPool.end();
  }
}

init().then(() => {
  console.log('✅ Database initialization complete');
  process.exit(0);
}).catch(err => {
  console.error('❌ Database initialization failed:', err.message);
  process.exit(1);
});
