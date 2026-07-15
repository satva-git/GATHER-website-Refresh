'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { normalizePagePath } = require('./path-utils');
const { getDataDir, ensureDataDir } = require('./data-dir');
const remoteStore = require('./remote-store');

const DB_PATH = process.env.REVIEW_DB_PATH || path.join(getDataDir(), 'review.db.json');
const REMOTE_KEY = 'review.db';

const DEFAULT_DATA = {
  sessions: [],
  comments: [],
  replies: []
};

let data = null;
let writeQueue = Promise.resolve();

function ensureDbDir() {
  ensureDataDir();
}

const SEED_DB_PATH = path.join(__dirname, 'seed', 'review.db.json');

function normalizeData(raw) {
  const next = raw && typeof raw === 'object' ? raw : {};
  if (!Array.isArray(next.sessions)) next.sessions = [];
  if (!Array.isArray(next.comments)) next.comments = [];
  if (!Array.isArray(next.replies)) next.replies = [];
  return next;
}

function seedFromTemplateIfNeeded() {
  if (!fs.existsSync(SEED_DB_PATH)) return;

  let needsSeed = !fs.existsSync(DB_PATH);
  if (!needsSeed) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
      const comments = Array.isArray(parsed.comments) ? parsed.comments : [];

      // Never overwrite a DB that already has review comments.
      if (comments.length > 0) return;

      needsSeed = sessions.length === 0;
      if (!needsSeed) {
        const defaultsPath = path.join(__dirname, 'review-defaults.json');
        if (fs.existsSync(defaultsPath)) {
          const defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf8'));
          const token = defaults && defaults.defaultReviewToken;
          if (token && !sessions.some(s => s.token === token)) {
            needsSeed = true;
          }
        }
      }
    } catch (err) {
      needsSeed = true;
    }
  }

  if (!needsSeed) return;

  try {
    fs.copyFileSync(SEED_DB_PATH, DB_PATH);
    console.log('[db] Seeded review database from', SEED_DB_PATH);
  } catch (err) {
    console.warn('[db] Could not seed review database:', err.message);
  }
}

function load() {
  ensureDbDir();
  seedFromTemplateIfNeeded();
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
    fs.copyFileSync(DB_PATH, backup);
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
  // Keep the local JSON write synchronous so API responses always reflect
  // durable-on-disk state even when the optional remote store is slow/down.
  persistSync();
  writeQueue = writeQueue
    .then(async () => {
      await remoteStore.saveJson(REMOTE_KEY, data);
    })
    .catch(err => {
      console.error('[db] persist failed:', err);
    });
  return writeQueue;
}

async function bootstrap() {
  if (!remoteStore.isEnabled()) {
    console.log('[db] remote store disabled (no DATABASE_URL); using local file only');
    return;
  }

  const remote = await remoteStore.loadJson(REMOTE_KEY);
  if (remote) {
    data = normalizeData(remote);
    persistSync();
    console.log(
      '[db] Restored review database from Postgres:',
      data.comments.length,
      'comments,',
      data.sessions.length,
      'sessions'
    );
    return;
  }

  // First boot with Postgres: push the local/seeded DB so future restarts keep it.
  await remoteStore.saveJson(REMOTE_KEY, data);
  console.log(
    '[db] Initialized Postgres review database from local file:',
    data.comments.length,
    'comments'
  );
}

function id() {
  return crypto.randomUUID();
}

function token() {
  return crypto.randomBytes(16).toString('hex');
}

function now() {
  return new Date().toISOString();
}

function getSessionByToken(sessionToken) {
  return data.sessions.find(s => s.token === sessionToken) || null;
}

function listSessions() {
  return [...data.sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function createSession({ title, pagePath }) {
  const session = {
    id: id(),
    token: token(),
    title: title || 'Homepage review',
    pagePath: normalizePagePath(pagePath),
    createdAt: now(),
    updatedAt: now()
  };
  data.sessions.unshift(session);
  persist();
  return session;
}

function resolveSessionForPage(pagePath) {
  const normalized = normalizePagePath(pagePath);
  return listSessions().find(session => normalizePagePath(session.pagePath) === normalized) || null;
}

function attachReplies(comments) {
  return comments.map(comment => ({
    ...comment,
    replies: data.replies
      .filter(r => r.commentId === comment.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }));
}

function listComments(sessionToken) {
  const session = getSessionByToken(sessionToken);
  if (!session) return null;
  const comments = data.comments
    .filter(c => c.sessionId === session.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return attachReplies(comments);
}

function getComment(commentId) {
  const comment = data.comments.find(c => c.id === commentId) || null;
  if (!comment) return null;
  return attachReplies([comment])[0];
}

function createComment(sessionToken, payload) {
  const session = getSessionByToken(sessionToken);
  if (!session) return null;

  const authorName = String(payload.authorName || '').trim();
  const body = String(payload.body || '').trim();
  if (!authorName || !body) {
    return { error: 'authorName and body are required' };
  }

  const comment = {
    id: id(),
    sessionId: session.id,
    authorName,
    pagePath: normalizePagePath(payload.pagePath || session.pagePath || '/'),
    sectionId: payload.sectionId || null,
    sectionLabel: payload.sectionLabel || null,
    scrollY: Number.isFinite(payload.scrollY) ? payload.scrollY : 0,
    pinX: Number.isFinite(payload.pinX) ? payload.pinX : null,
    pinY: Number.isFinite(payload.pinY) ? payload.pinY : null,
    tabId: String(payload.tabId || 'default').trim(),
    body,
    status: 'open',
    createdAt: now(),
    updatedAt: now()
  };

  data.comments.push(comment);
  session.updatedAt = now();
  persist();
  return getComment(comment.id);
}

function updateComment(commentId, updates) {
  const index = data.comments.findIndex(c => c.id === commentId);
  if (index === -1) return null;
  const comment = data.comments[index];

  if (updates.status === 'open' || updates.status === 'resolved') {
    comment.status = updates.status;
  }
  if (typeof updates.body === 'string') {
    const body = updates.body.trim();
    if (!body) return { error: 'Comment cannot be empty' };
    comment.body = body;
  }
  comment.updatedAt = now();

  const session = data.sessions.find(s => s.id === comment.sessionId);
  if (session) session.updatedAt = now();

  persist();
  return getComment(comment.id);
}

function deleteComment(commentId) {
  const index = data.comments.findIndex(c => c.id === commentId);
  if (index === -1) return false;
  const comment = data.comments[index];
  data.comments.splice(index, 1);
  data.replies = data.replies.filter(r => r.commentId !== commentId);

  const session = data.sessions.find(s => s.id === comment.sessionId);
  if (session) session.updatedAt = now();

  persist();
  return true;
}

function createReply(commentId, payload) {
  const comment = data.comments.find(c => c.id === commentId);
  if (!comment) return null;

  const authorName = String(payload.authorName || 'Guest').trim() || 'Guest';
  const body = String(payload.body || '').trim();
  if (!body) return { error: 'body is required' };

  const reply = {
    id: id(),
    commentId,
    sessionId: comment.sessionId,
    authorName,
    body,
    createdAt: now()
  };

  data.replies.push(reply);
  comment.updatedAt = now();

  const session = data.sessions.find(s => s.id === comment.sessionId);
  if (session) session.updatedAt = now();

  persist();
  return reply;
}

load();

module.exports = {
  bootstrap,
  getSessionByToken,
  listSessions,
  createSession,
  resolveSessionForPage,
  listComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  createReply
};
