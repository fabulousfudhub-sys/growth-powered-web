const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'atapoly_cbt',
  user: process.env.DB_USER || 'cbt_admin',
  password: process.env.DB_PASSWORD || 'cbt_password',
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Schools
    const schoolId = uuid();
    await client.query(
      `INSERT INTO schools (id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
      [schoolId, 'School of Engineering Technology']
    );

    // Departments
    const deptId = uuid();
    await client.query(
      `INSERT INTO departments (id, name, school_id, programmes, levels) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name, school_id) DO NOTHING`,
      [deptId, 'Computer Science', schoolId, ['ND', 'HND'], ['ND1', 'ND2', 'HND1', 'HND2']]
    );

    // Super Admin
    const adminHash = await bcrypt.hash('admin123', 10);
    const adminId = uuid();
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      [adminId, 'System Administrator', 'admin@cbt.edu.ng', adminHash, 'super_admin']
    );

    // Instructor
    const instrHash = await bcrypt.hash('instructor123', 10);
    const instrId = uuid();
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, department_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
      [instrId, 'Dr. Adeyemi', 'adeyemi@cbt.edu.ng', instrHash, 'instructor', deptId]
    );

    // Course
    const courseId = uuid();
    await client.query(
      `INSERT INTO courses (id, code, title, department_id, school_id, programme, level, instructor_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (code, department_id) DO NOTHING`,
      [courseId, 'COM211', 'Introduction to Programming', deptId, schoolId, 'ND', 'ND1', instrId]
    );

    // Sample students
    const studentHash = await bcrypt.hash('student123', 10);
    for (let i = 1; i <= 5; i++) {
      const sId = uuid();
      const regNum = `ATAP/ND/COM/23/${String(i).padStart(3, '0')}`;
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, reg_number, department_id, level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (reg_number) DO NOTHING`,
        [sId, `Student ${i}`, `student${i}@cbt.edu.ng`, studentHash, 'student', regNum, deptId, 'ND1']
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed data inserted');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
