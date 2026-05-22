'use strict';

console.log('[startup] Node', process.version);
console.log('[startup] cwd', process.cwd());
console.log('[startup] PORT', process.env.PORT);
console.log('[startup] HTTP_PLATFORM_PORT', process.env.HTTP_PLATFORM_PORT);
console.log('[startup] REVIEW_DATA_DIR', process.env.REVIEW_DATA_DIR);

const fs = require('fs');
const path = require('path');

process.on('uncaughtException', function (err) {
  console.error('[startup] uncaughtException:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', function (err) {
  console.error('[startup] unhandledRejection:', err && err.stack ? err.stack : err);
});

const root = __dirname;
const homepage = path.join(root, 'HomePage.html');
const index = path.join(root, 'index.html');

try {
  if (fs.existsSync(homepage)) {
    fs.copyFileSync(homepage, index);
  }
} catch (err) {
  console.error('[startup] Could not sync HomePage.html to index.html:', err.message);
}

try {
  require('./server/index.js');
} catch (err) {
  console.error('[startup] Failed to load server/index.js:', err && err.stack ? err.stack : err);
  process.exit(1);
}
