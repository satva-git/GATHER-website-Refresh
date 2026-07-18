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
  replies: [],
  auditLog: []
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
  if (!Array.isArray(next.auditLog)) next.auditLog = [];
  return next;
}

function appendAudit(entry) {
  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: id(),
    at: now(),
    ...entry
  });
  if (data.auditLog.length > 1000) {
    data.auditLog = data.auditLog.slice(-1000);
  }
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
    const remoteData = normalizeData(remote);
    const localComments = Array.isArray(data && data.comments) ? data.comments.length : 0;
    const remoteComments = remoteData.comments.length;

    // Never wipe a non-empty local DB with an empty/smaller remote snapshot.
    // This protects against accidental empty Postgres restores after redeploys.
    if (remoteComments === 0 && localComments > 0) {
      console.warn(
        '[db] Remote review DB is empty but local has',
        localComments,
        'comment(s); keeping local and pushing to Postgres'
      );
      await remoteStore.saveJson(REMOTE_KEY, data);
      return;
    }

    if (remoteComments > 0 && localComments > remoteComments) {
      console.warn(
        '[db] Local review DB has more comments than Postgres (',
        localComments,
        'vs',
        remoteComments,
        '); merging by id and preferring newer updatedAt'
      );
      data = mergeReviewDatabases(data, remoteData);
      persistSync();
      await remoteStore.saveJson(REMOTE_KEY, data);
      console.log(
        '[db] Merged review database:',
        data.comments.length,
        'comments,',
        data.sessions.length,
        'sessions'
      );
      return;
    }

    data = remoteData;
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

function mergeById(primaryList, secondaryList) {
  const byId = new Map();
  (secondaryList || []).forEach(item => {
    if (item && item.id) byId.set(item.id, item);
  });
  (primaryList || []).forEach(item => {
    if (!item || !item.id) return;
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
      return;
    }
    const a = item.updatedAt || item.createdAt || '';
    const b = existing.updatedAt || existing.createdAt || '';
    byId.set(item.id, a >= b ? item : existing);
  });
  return Array.from(byId.values());
}

function mergeReviewDatabases(localData, remoteData) {
  const local = normalizeData(localData);
  const remote = normalizeData(remoteData);
  return {
    sessions: mergeById(local.sessions, remote.sessions),
    comments: mergeById(local.comments, remote.comments),
    replies: mergeById(local.replies, remote.replies),
    auditLog: mergeById(local.auditLog, remote.auditLog)
  };
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
    ownerUserId: null,
    createdAt: now(),
    updatedAt: now()
  };
  data.sessions.unshift(session);
  persist();
  return session;
}

function claimSessionOwner(sessionToken, userId) {
  const session = getSessionByToken(sessionToken);
  if (!session) return null;
  const uid = String(userId || '').trim();
  if (!uid) return { error: 'userId is required' };
  if (!session.ownerUserId) {
    session.ownerUserId = uid;
    session.updatedAt = now();
    appendAudit({
      action: 'claim_owner',
      sessionId: session.id,
      userId: uid
    });
    persist();
  }
  return session;
}

function isSessionOwner(sessionToken, userId) {
  const session = getSessionByToken(sessionToken);
  if (!session || !session.ownerUserId) return false;
  return session.ownerUserId === String(userId || '').trim();
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

function normalizeAnchor(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const selector = typeof raw.selector === 'string' ? raw.selector.trim() : '';
  const elementId = typeof raw.elementId === 'string' ? raw.elementId.trim() : '';
  const dataRvAnchor = typeof raw.dataRvAnchor === 'string'
    ? raw.dataRvAnchor.trim()
    : (typeof raw.rvAnchor === 'string' ? raw.rvAnchor.trim() : '');
  const textHint = typeof raw.textHint === 'string' ? raw.textHint.trim().slice(0, 120) : '';
  const tagName = typeof raw.tagName === 'string' ? raw.tagName.trim().toUpperCase() : '';
  const sectionId = typeof raw.sectionId === 'string' ? raw.sectionId.trim() : '';
  const offsetX = Number(raw.offsetX);
  const offsetY = Number(raw.offsetY);
  if (!selector && !elementId && !dataRvAnchor && !textHint) return null;
  return {
    dataRvAnchor: dataRvAnchor || null,
    selector: selector || null,
    elementId: elementId || null,
    textHint: textHint || null,
    tagName: tagName || null,
    sectionId: sectionId || null,
    offsetX: Number.isFinite(offsetX) ? Math.min(1, Math.max(0, offsetX)) : 0.5,
    offsetY: Number.isFinite(offsetY) ? Math.min(1, Math.max(0, offsetY)) : 0.15
  };
}

function createComment(sessionToken, payload) {
  const session = getSessionByToken(sessionToken);
  if (!session) return null;

  const authorName = String(payload.authorName || '').trim();
  const body = String(payload.body || '').trim();
  if (!authorName || !body) {
    return { error: 'authorName and body are required' };
  }

  const authorUserId = typeof payload.authorUserId === 'string'
    ? payload.authorUserId.trim()
    : null;

  const comment = {
    id: id(),
    sessionId: session.id,
    authorName,
    authorUserId: authorUserId || null,
    pagePath: normalizePagePath(payload.pagePath || session.pagePath || '/'),
    sectionId: payload.sectionId || null,
    sectionLabel: payload.sectionLabel || null,
    scrollY: Number.isFinite(payload.scrollY) ? payload.scrollY : 0,
    pinX: Number.isFinite(payload.pinX) ? payload.pinX : null,
    pinY: Number.isFinite(payload.pinY) ? payload.pinY : null,
    // Element-based anchor so pins follow their target after layout shifts.
    anchor: normalizeAnchor(payload.anchor),
    tabId: String(payload.tabId || 'default').trim(),
    body,
    status: 'open',
    pinned: false,
    reactions: {},
    lastEditedBy: authorName,
    lastEditedAt: now(),
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

  // Optimistic concurrency: reject stale edits when another user saved first.
  if (updates.baseUpdatedAt && comment.updatedAt && updates.baseUpdatedAt < comment.updatedAt) {
    const editedBy = comment.lastEditedBy || 'another user';
    return {
      error: 'conflict',
      message: editedBy + ' edited this comment. Reload to see changes.',
      comment: getComment(comment.id)
    };
  }

  if (updates.status === 'open' || updates.status === 'resolved') {
    comment.status = updates.status;
  }
  if (typeof updates.body === 'string') {
    const body = updates.body.trim();
    if (!body) return { error: 'Comment cannot be empty' };
    comment.body = body;
  }
  if (typeof updates.pinned === 'boolean') {
    comment.pinned = updates.pinned;
  }
  if (Object.prototype.hasOwnProperty.call(updates, 'anchor')) {
    comment.anchor = normalizeAnchor(updates.anchor);
    if (updates.legacy === false) comment.legacy = false;
  }
  if (typeof updates.legacy === 'boolean') {
    comment.legacy = updates.legacy;
  }
  if (Number.isFinite(updates.pinX)) comment.pinX = updates.pinX;
  if (Number.isFinite(updates.pinY)) comment.pinY = updates.pinY;

  const editor = typeof updates.lastEditedBy === 'string' && updates.lastEditedBy.trim()
    ? updates.lastEditedBy.trim()
    : comment.authorName;
  comment.lastEditedBy = editor;
  comment.lastEditedAt = now();
  comment.updatedAt = now();

  const session = data.sessions.find(s => s.id === comment.sessionId);
  if (session) session.updatedAt = now();

  persist();
  return getComment(comment.id);
}

function setCommentPinned(commentId, pinned) {
  return updateComment(commentId, { pinned: !!pinned });
}

function addCommentReaction(commentId, emoji) {
  const index = data.comments.findIndex(c => c.id === commentId);
  if (index === -1) return null;
  const key = String(emoji || '').trim();
  if (!key) return { error: 'emoji is required' };
  const comment = data.comments[index];
  if (!comment.reactions || typeof comment.reactions !== 'object') comment.reactions = {};
  comment.reactions[key] = (comment.reactions[key] || 0) + 1;
  comment.updatedAt = now();
  persist();
  return getComment(comment.id);
}

function removeCommentReaction(commentId, emoji) {
  const index = data.comments.findIndex(c => c.id === commentId);
  if (index === -1) return null;
  const key = String(emoji || '').trim();
  if (!key) return { error: 'emoji is required' };
  const comment = data.comments[index];
  if (!comment.reactions || !comment.reactions[key]) {
    return getComment(comment.id);
  }
  comment.reactions[key] -= 1;
  if (comment.reactions[key] <= 0) delete comment.reactions[key];
  comment.updatedAt = now();
  persist();
  return getComment(comment.id);
}

function deleteComment(commentId, meta) {
  const index = data.comments.findIndex(c => c.id === commentId);
  if (index === -1) return false;
  const comment = data.comments[index];
  data.comments.splice(index, 1);
  data.replies = data.replies.filter(r => r.commentId !== commentId);

  const session = data.sessions.find(s => s.id === comment.sessionId);
  if (session) session.updatedAt = now();

  appendAudit({
    action: 'delete_comment',
    commentId,
    sessionId: comment.sessionId,
    userId: meta && meta.userId ? meta.userId : null,
    authorName: comment.authorName,
    reason: meta && meta.reason ? meta.reason : 'single_delete'
  });

  persist();
  return true;
}

function listAuditLog(limit) {
  const max = Number.isFinite(limit) ? limit : 100;
  return (data.auditLog || []).slice(-max).reverse();
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
  claimSessionOwner,
  isSessionOwner,
  resolveSessionForPage,
  listComments,
  getComment,
  createComment,
  updateComment,
  setCommentPinned,
  addCommentReaction,
  removeCommentReaction,
  deleteComment,
  createReply,
  listAuditLog
};
