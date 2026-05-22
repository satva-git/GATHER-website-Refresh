'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { normalizePagePath } = require('./path-utils');
const { getDataDir, ensureDataDir } = require('./data-dir');

const DB_PATH = process.env.REVIEW_DB_PATH || path.join(getDataDir(), 'review.db.json');
const DATA_DIR = path.dirname(DB_PATH);

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

function load() {
  ensureDbDir();
  if (!fs.existsSync(DB_PATH)) {
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    persistSync();
    return;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    data = JSON.parse(raw);
    if (!Array.isArray(data.sessions)) data.sessions = [];
    if (!Array.isArray(data.comments)) data.comments = [];
    if (!Array.isArray(data.replies)) data.replies = [];
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
