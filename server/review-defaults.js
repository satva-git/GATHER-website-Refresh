'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULTS_PATH = process.env.REVIEW_DEFAULTS_PATH ||
  path.join(__dirname, 'review-defaults.json');

let cached = null;

function loadReviewDefaults() {
  if (cached) return cached;

  try {
    if (!fs.existsSync(DEFAULTS_PATH)) {
      cached = null;
      return null;
    }
    const raw = fs.readFileSync(DEFAULTS_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data.defaultReviewToken) {
      cached = null;
      return null;
    }
    cached = {
      defaultReviewToken: String(data.defaultReviewToken).trim(),
      label: data.label || 'Primary review link'
    };
    return cached;
  } catch (err) {
    console.warn('[review-defaults] Could not load:', err.message);
    cached = null;
    return null;
  }
}

function getDefaultReviewToken() {
  const defaults = loadReviewDefaults();
  return defaults ? defaults.defaultReviewToken : null;
}

module.exports = {
  loadReviewDefaults,
  getDefaultReviewToken,
  DEFAULTS_PATH
};
