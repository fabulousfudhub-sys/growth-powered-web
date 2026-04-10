const { Router } = require('express');
const { pool } = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

// Get site settings (public - no auth needed for branding)
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT settings FROM site_settings WHERE id = 1`);
    res.json(rows.length > 0 ? rows[0].settings : {});
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site settings (super_admin only)
router.put('/', authenticate, requireRole('super_admin'), async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings object' });
  }
  try {
    await pool.query(
      `INSERT INTO site_settings (id, settings, updated_at) VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET settings = $1, updated_at = NOW()`,
      [JSON.stringify(settings)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Get system status (lock + deactivation)
router.get('/system-status', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT settings FROM site_settings WHERE id = 1`);
    const settings = rows.length > 0 ? rows[0].settings : {};
    res.json({
      locked: settings.systemLocked || false,
      deactivated: settings.systemDeactivated || false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system status' });
  }
});

// Set system lock (super_admin/admin)
router.post('/system-lock', authenticate, requireRole('super_admin', 'admin'), async (req, res) => {
  const { locked } = req.body;
  try {
    const { rows } = await pool.query(`SELECT settings FROM site_settings WHERE id = 1`);
    const current = rows.length > 0 ? rows[0].settings : {};
    current.systemLocked = !!locked;
    await pool.query(
      `INSERT INTO site_settings (id, settings, updated_at) VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET settings = $1, updated_at = NOW()`,
      [JSON.stringify(current)]
    );
    res.json({ success: true, locked: !!locked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update system lock' });
  }
});

// Set system active/deactivated (super_admin ONLY — license toggle)
router.post('/system-active', authenticate, requireRole('super_admin'), async (req, res) => {
  const { active } = req.body;
  try {
    const { rows } = await pool.query(`SELECT settings FROM site_settings WHERE id = 1`);
    const current = rows.length > 0 ? rows[0].settings : {};
    current.systemDeactivated = !active;
    await pool.query(
      `INSERT INTO site_settings (id, settings, updated_at) VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET settings = $1, updated_at = NOW()`,
      [JSON.stringify(current)]
    );
    res.json({ success: true, deactivated: !active });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update system status' });
  }
});

module.exports = router;
