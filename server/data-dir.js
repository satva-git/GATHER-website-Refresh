'use strict';

const fs = require('fs');
const path = require('path');

function getDataDir() {
  if (process.env.REVIEW_DATA_DIR) {
    return process.env.REVIEW_DATA_DIR;
  }

  if (process.env.WEBSITE_SITE_NAME && process.env.HOME) {
    return path.join(process.env.HOME, 'site', 'data');
  }

  return path.join(__dirname, 'data');
}

function ensureDataDir() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

module.exports = {
  getDataDir,
  ensureDataDir
};
