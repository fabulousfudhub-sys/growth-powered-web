const fs = require('fs');
const path = require('path');

const CACHE_PATH = path.join(__dirname, 'cache.json');
const CACHE_DURATION_DAYS = 7;

// Read cached license
function getCachedLicense() {
  if (!fs.existsSync(CACHE_PATH)) return null;

  const data = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  const now = new Date();
  const expiresAt = new Date(data.expiresAt);

  if (expiresAt > now) return data.licenseKey;
  return null;
}

// Cache a new license key
function cacheLicense(key) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);

  const data = {
    licenseKey: key,
    expiresAt: expiresAt.toISOString(),
  };

  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`License cached until ${expiresAt.toISOString()}`);
}

module.exports = { getCachedLicense, cacheLicense };