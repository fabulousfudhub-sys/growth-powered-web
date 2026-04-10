// test-license.js
const { getCachedLicense, cacheLicense } = require('./license/license');

// Cache a new license
cacheLicense('TEST-KEY-123');

// Read the cached license
console.log('Cached license:', getCachedLicense());