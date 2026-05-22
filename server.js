'use strict';

const fs = require('fs');
const path = require('path');

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

require('./server/index.js');
