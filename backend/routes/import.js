const { Router } = require('express');
const { pool } = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = Router();

// Bulk import students from CSV data
router.post('/students', authenticate, requireRole('super_admin', 'admin', 'examiner'), async (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'No student data provided' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = { created: 0, skipped: 0, errors: [] };
    const defaultHash = await bcrypt.hash('changeme123', 10);

    for (const s of students) {
      if (!s.name || !s.regNumber) {
        results.skipped++;
        results.errors.push(`Skipped: missing name or reg_number for "${s.name || 'unknown'}"`);
        continue;
      }

      try {
        // Find department by name
        let departmentId = null;
        if (s.department) {
          const { rows: depts } = await client.query(
            `SELECT id FROM departments WHERE LOWER(name) = LOWER($1) LIMIT 1`,
            [s.department.trim()]
          );
          if (depts.length > 0) departmentId = depts[0].id;
        }

        const { rowCount } = await client.query(
          `INSERT INTO users (name, email, password_hash, role, reg_number, department_id, level)
           VALUES ($1, $2, $3, 'student', $4, $5, $6)
           ON CONFLICT (reg_number) DO NOTHING`,
          [s.name.trim(), s.email?.trim() || null, defaultHash, s.regNumber.trim(), departmentId, s.level?.trim() || null]
        );
        if (rowCount > 0) results.created++;
        else results.skipped++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`Error for "${s.name}": ${err.message}`);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bulk import error:', err);
    res.status(500).json({ error: 'Bulk import failed' });
  } finally {
    client.release();
  }
});

// Bulk import questions from CSV data
router.post('/questions', authenticate, requireRole('super_admin', 'admin', 'examiner', 'instructor'), async (req, res) => {
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'No question data provided' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = { created: 0, skipped: 0, errors: [] };

    // Pre-fetch course lookup
    const { rows: allCourses } = await client.query(`SELECT id, code FROM courses`);
    const courseMap = {};
    allCourses.forEach(c => { courseMap[c.code.toLowerCase()] = c.id; });

    for (const q of questions) {
      if (!q.text || !q.type) {
        results.skipped++;
        results.errors.push(`Skipped: missing text or type`);
        continue;
      }

      try {
        const courseId = courseMap[(q.course || '').toLowerCase()];
        if (!courseId) {
          results.skipped++;
          results.errors.push(`Skipped "${q.text.substring(0, 40)}...": course "${q.course}" not found`);
          continue;
        }

        // Build options array for MCQ
        let options = null;
        if (q.type === 'mcq') {
          const opts = [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(o => o && o.trim());
          options = JSON.stringify(opts);
        }

        const correctAnswer = q.correct_answer ? JSON.stringify(q.correct_answer) : null;

        await client.query(
          `INSERT INTO questions (type, text, options, correct_answer, difficulty, course_id, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [q.type, q.text, options, correctAnswer, q.difficulty || 'medium', courseId, req.user.id]
        );
        results.created++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`Error: ${err.message}`);
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Question import error:', err);
    res.status(500).json({ error: 'Question import failed' });
  } finally {
    client.release();
  }
});

module.exports = router;
