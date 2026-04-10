const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { syncNow, getSyncStatus, pushOnly, pullOnly } = require('../services/sync');

const router = Router();

// Get sync status
router.get('/status', authenticate, requireRole('super_admin', 'admin'), async (_req, res) => {
  try {
    const status = await getSyncStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

// Manual sync trigger (full 2-way)
router.post('/trigger', authenticate, requireRole('super_admin', 'admin'), async (_req, res) => {
  try {
    const result = await syncNow();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', message: err.message });
  }
});

// Push only
router.post('/push', authenticate, requireRole('super_admin', 'admin'), async (_req, res) => {
  try {
    const result = await pushOnly();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Push failed', message: err.message });
  }
});

// Pull only
router.post('/pull', authenticate, requireRole('super_admin', 'admin'), async (_req, res) => {
  try {
    const result = await pullOnly();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Pull failed', message: err.message });
  }
});

module.exports = router;
