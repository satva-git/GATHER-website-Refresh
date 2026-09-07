'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');

test('FAQ GEO verification script passes', () => {
  const out = execSync('node scripts/verify-faq-geo.js', { cwd: ROOT, encoding: 'utf8' });
  assert.match(out, /All FAQ GEO checks passed/);
});
