const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { getCachedLicense, cacheLicense } = require('../license/license');
const fs = require('fs');
const path = require('path');

const router = Router();

const CACHE_PATH = path.join(__dirname, '..', 'license', 'cache.json');

// Get license status (super_admin only)
router.get('/status', authenticate, requireRole('super_admin'), async (_req, res) => {
  try {
    const key = getCachedLicense();
    let expiresAt = null;

    if (fs.existsSync(CACHE_PATH)) {
      const data = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
      expiresAt = data.expiresAt;
    }

    res.json({
      active: !!key,
      licenseKey: key ? `${key.slice(0, 4)}****${key.slice(-4)}` : null,
      expiresAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check license status' });
  }
});

// Activate license (super_admin only)
router.post('/activate', authenticate, requireRole('super_admin'), async (req, res) => {
  try {
    const { licenseKey } = req.body;
    if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim().length < 4) {
      return res.status(400).json({ error: 'Invalid license key' });
    }

    // TODO: Add remote validation against a license server here
    // For now, accept any key and cache it
    cacheLicense(licenseKey.trim());

    res.json({ success: true, message: 'License activated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to activate license' });
  }
});

// Deactivate license (super_admin only)
router.post('/deactivate', authenticate, requireRole('super_admin'), async (_req, res) => {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      fs.unlinkSync(CACHE_PATH);
    }
    res.json({ success: true, message: 'License deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate license' });
  }
});

module.exports = router;
