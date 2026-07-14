'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getDataDir, ensureDataDir } = require('./data-dir');
const remoteStore = require('./remote-store');

const DB_PATH = process.env.PAGE_COMMENTS_DB_PATH ||
  path.join(getDataDir(), 'page-comments.json');
const REMOTE_KEY = 'page-comments';

const DEFAULT_DATA = { comments: [] };

let data = null;
let writeQueue = Promise.resolve();

function ensureDbDir() {
  ensureDataDir();
}

function normalizeData(raw) {
  const next = raw && typeof raw === 'object' ? raw : {};
  if (!Array.isArray(next.comments)) next.comments = [];
  return next;
}

function load() {
  ensureDbDir();
  if (!fs.existsSync(DB_PATH)) {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    persistSync();
    return;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    data = normalizeData(JSON.parse(raw));
  } catch (err) {
    const backup = DB_PATH + '.corrupt-' + Date.now();
    if (fs.existsSync(DB_PATH)) fs.copyFileSync(DB_PATH, backup);
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    persistSync();
  }
}

function persistSync() {
  ensureDbDir();
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

function persist() {
  writeQueue = writeQueue
    .then(async () => {
      persistSync();
      await remoteStore.saveJson(REMOTE_KEY, data);
    })
    .catch(err => {
      console.error('[page-comments-db] persist failed:', err);
    });
  return writeQueue;
}

async function bootstrap() {
  if (!remoteStore.isEnabled()) return;

  const remote = await remoteStore.loadJson(REMOTE_KEY);
  if (remote) {
    data = normalizeData(remote);
    persistSync();
    console.log(
      '[page-comments-db] Restored from Postgres:',
      data.comments.length,
      'comments'
    );
    return;
  }

  await remoteStore.saveJson(REMOTE_KEY, data);
  console.log('[page-comments-db] Initialized Postgres from local file');
}

function id() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function normalizePagePath(pagePath) {
  const value = String(pagePath || '/').trim();
  if (!value.startsWith('/')) return '/' + value;
  return value;
}

function listComments(pagePath) {
  const normalized = normalizePagePath(pagePath);
  return data.comments
    .filter(c => c.pagePath === normalized)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function listAllComments() {
  return [...data.comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getComment(commentId) {
  return data.comments.find(c => c.id === commentId) || null;
}

function createComment(payload) {
  const body = String(payload.body || '').trim();
  if (!body) return { error: 'body is required' };

  const pinX = Number(payload.pinX);
  const pinY = Number(payload.pinY);
  if (!Number.isFinite(pinX) || !Number.isFinite(pinY)) {
    return { error: 'pinX and pinY are required' };
  }

  const comment = {
    id: id(),
    pagePath: normalizePagePath(payload.pagePath),
    body,
    pinX,
    pinY,
    createdAt: now(),
    updatedAt: now()
  };

  data.comments.push(comment);
  persist();
  return comment;
}

function deleteComment(commentId) {
  const index = data.comments.findIndex(c => c.id === commentId);
  if (index === -1) return null;
  const comment = data.comments[index];
  data.comments.splice(index, 1);
  persist();
  return comment;
}

load();

module.exports = {
  DB_PATH,
  bootstrap,
  normalizePagePath,
  listComments,
  listAllComments,
  getComment,
  createComment,
  deleteComment
};
