'use strict';

/**
 * Optional durable store for review JSON databases.
 * When DATABASE_URL is set (Render Postgres), the full JSON document
 * is kept in a single kv_store row so comments survive free-tier spin-downs.
 */

const { Client } = require('pg');

let initPromise = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.REVIEW_DATABASE_URL || '';
}

function isEnabled() {
  return Boolean(getDatabaseUrl());
}

async function withClient(fn) {
  const client = new Client({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

async function ensureSchema() {
  if (!isEnabled()) return false;
  if (!initPromise) {
    initPromise = withClient(async client => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS kv_store (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      console.log('[remote-store] Postgres kv_store ready');
    }).catch(err => {
      initPromise = null;
      console.error('[remote-store] schema init failed:', err.message);
      throw err;
    });
  }
  await initPromise;
  return true;
}

async function loadJson(key) {
  if (!isEnabled()) return null;
  try {
    await ensureSchema();
    return await withClient(async client => {
      const result = await client.query(
        'SELECT value FROM kv_store WHERE key = $1',
        [key]
      );
      if (!result.rows.length) return null;
      return result.rows[0].value;
    });
  } catch (err) {
    console.error('[remote-store] load failed for', key, err.message);
    return null;
  }
}

async function saveJson(key, value) {
  if (!isEnabled()) return false;
  try {
    await ensureSchema();
    await withClient(async client => {
      await client.query(
        `INSERT INTO kv_store (key, value, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    });
    return true;
  } catch (err) {
    console.error('[remote-store] save failed for', key, err.message);
    return false;
  }
}

module.exports = {
  isEnabled,
  ensureSchema,
  loadJson,
  saveJson
};
