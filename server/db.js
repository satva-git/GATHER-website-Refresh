'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.dirname(process.env.REVIEW_DB_PATH || path.join(__dirname, 'data', 'review.db.json'));
const DB_PATH = process.env.REVIEW_DB_PATH || path.join(__dirname, 'data', 'review.db.json');

const DEFAULT_DATA = {
  sessions: [],
  comments: []
};

let data = null;
let writeQueue = Promise.resolve();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    data = structuredClone(DEFAULT_DATA);
    persistSync();
    return;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    data = JSON.parse(raw);
    if (!Array.isArray(data.sessions)) data.sessions = [];
    if (!Array.isArray(data.comments)) data.comments = [];
  } catch (err) {
    const backup = DB_PATH + '.corrupt-' + Date.now();
    fs.copyFileSync(DB_PATH, backup);
    data = structuredClone(DEFAULT_DATA);
    persistSync();
  }
}

function persistSync() {
  ensureDataDir();
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DB_PATH);
}

function persist() {
  writeQueue = writeQueue.then(() => {
    persistSync();
  }).catch(err => {
    console.error('[db] persist failed:', err);
  });
  return writeQueue;
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
    pagePath: pagePath || '/',
    createdAt: now(),
    updatedAt: now()
  };
  data.sessions.unshift(session);
  persist();
  return session;
}

function listComments(sessionToken) {
  const session = getSessionByToken(sessionToken);
  if (!session) return null;
  return data.comments
    .filter(c => c.sessionId === session.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function getComment(commentId) {
  return data.comments.find(c => c.id === commentId) || null;
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
    sectionId: payload.sectionId || null,
    sectionLabel: payload.sectionLabel || null,
    scrollY: Number.isFinite(payload.scrollY) ? payload.scrollY : 0,
    pinX: Number.isFinite(payload.pinX) ? payload.pinX : null,
    pinY: Number.isFinite(payload.pinY) ? payload.pinY : null,
    body,
    status: 'open',
    createdAt: now(),
    updatedAt: now()
  };

  data.comments.push(comment);
  session.updatedAt = now();
  persist();
  return comment;
}

function updateComment(commentId, updates) {
  const comment = getComment(commentId);
  if (!comment) return null;

  if (updates.status === 'open' || updates.status === 'resolved') {
    comment.status = updates.status;
  }
  if (typeof updates.body === 'string') {
    const body = updates.body.trim();
    if (body) comment.body = body;
  }
  comment.updatedAt = now();

  const session = data.sessions.find(s => s.id === comment.sessionId);
  if (session) session.updatedAt = now();

  persist();
  return comment;
}

function deleteComment(commentId) {
  const index = data.comments.findIndex(c => c.id === commentId);
  if (index === -1) return false;
  const comment = data.comments[index];
  data.comments.splice(index, 1);

  const session = data.sessions.find(s => s.id === comment.sessionId);
  if (session) session.updatedAt = now();

  persist();
  return true;
}

load();

module.exports = {
  getSessionByToken,
  listSessions,
  createSession,
  listComments,
  getComment,
  createComment,
  updateComment,
  deleteComment
};
