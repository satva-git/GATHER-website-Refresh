'use strict';

const express = require('express');
const path = require('path');
const os = require('os');
const db = require('./db');
const pageCommentsDb = require('./page-comments-db');
const { getDataDir } = require('./data-dir');
const { loadReviewDefaults, getDefaultReviewToken } = require('./review-defaults');

const ROOT = path.join(__dirname, '..');

function getListenTarget() {
  const raw = process.env.PORT || process.env.HTTP_PLATFORM_PORT || '3000';
  if (/^\d+$/.test(String(raw))) {
    return Number(raw);
  }
  return raw;
}

const PORT = getListenTarget();
const useNamedPipe = typeof PORT !== 'number';
const HOST = useNamedPipe ? undefined : (process.env.HOST || '0.0.0.0');

console.log('[startup] listen target:', typeof PORT === 'number' ? `tcp:${PORT}` : PORT);
console.log('[startup] azure:', Boolean(process.env.WEBSITE_SITE_NAME || process.env.WEBSITE_INSTANCE_ID));
console.log('[startup] data dir:', getDataDir());

if (typeof PORT === 'number' && (!Number.isFinite(PORT) || PORT < 0)) {
  console.error('[startup] Invalid PORT:', process.env.PORT, process.env.HTTP_PLATFORM_PORT);
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));

app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

/** @type {Map<string, Set<import('http').ServerResponse>>} */
const sseClients = new Map();

/** @type {Set<import('http').ServerResponse>} */
const pageCommentSseClients = new Set();

function getBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  }
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('x-forwarded-host') || req.get('host');
  return `${proto}://${host}`;
}

function broadcast(sessionToken, event, payload) {
  const clients = sseClients.get(sessionToken);
  if (!clients || clients.size === 0) return;
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    try {
      res.write(message);
    } catch (err) {
      clients.delete(res);
    }
  }
}

function broadcastAll(event, payload) {
  for (const [key, clients] of sseClients.entries()) {
    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const res of clients) {
      res.write(message);
    }
  }
}

function prepareEventStream(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

function broadcastPageComment(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of pageCommentSseClients) {
    res.write(message);
  }
}

app.get('/api/health', (_req, res) => {
  const lan = getLanAddress();
  res.json({
    ok: true,
    time: new Date().toISOString(),
    networkUrl: lan ? `http://${lan}:${PORT}` : null
  });
});

app.get('/api/review-default', (req, res) => {
  const defaults = loadReviewDefaults();
  if (!defaults) {
    return res.status(404).json({ error: 'No default review link configured' });
  }
  const session = db.getSessionByToken(defaults.defaultReviewToken);
  if (!session) {
    return res.status(404).json({ error: 'Default review session not found' });
  }
  const shareUrl = `${getBaseUrl(req)}${session.pagePath}?review=${session.token}`;
  res.json({
    label: defaults.label,
    session,
    shareUrl
  });
});

function redirectToDefaultReview(req, res, next) {
  if (req.query.review) return next();
  const token = getDefaultReviewToken();
  if (!token) return next();
  const session = db.getSessionByToken(token);
  if (!session) return next();
  const query = new URLSearchParams(req.query);
  query.set('review', session.token);
  const qs = query.toString();
  return res.redirect(302, req.path + (qs ? '?' + qs : ''));
}

app.get('/api/sessions/resolve', (req, res) => {
  const { normalizePagePath } = require('./path-utils');
  const pagePath = normalizePagePath(req.query.path || '/');
  const session = db.resolveSessionForPage(pagePath);
  if (!session) {
    return res.status(404).json({
      error: 'No review session for this page yet. Create a share link in Admin first.',
      pagePath
    });
  }
  const shareUrl = `${getBaseUrl(req)}${session.pagePath}?review=${session.token}`;
  res.json({ session, shareUrl, pagePath });
});

app.get('/api/sessions', (_req, res) => {
  const sessions = db.listSessions().map(session => ({
    ...session,
    commentCount: db.listComments(session.token)?.length || 0,
    openCount: (db.listComments(session.token) || []).filter(c => c.status === 'open').length
  }));
  res.json({ sessions });
});

app.post('/api/sessions', (req, res) => {
  const session = db.createSession({
    title: req.body?.title,
    pagePath: req.body?.pagePath
  });
  const shareUrl = `${getBaseUrl(req)}${session.pagePath}?review=${session.token}`;
  broadcastAll('session_created', { session });
  res.status(201).json({ session, shareUrl });
});

app.get('/api/sessions/:token', (req, res) => {
  const session = db.getSessionByToken(req.params.token);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ session });
});

app.get('/api/sessions/:token/comments', (req, res) => {
  const comments = db.listComments(req.params.token);
  if (comments === null) return res.status(404).json({ error: 'Session not found' });
  res.json({ comments });
});

app.post('/api/sessions/:token/comments', (req, res) => {
  const result = db.createComment(req.params.token, req.body || {});
  if (!result) return res.status(404).json({ error: 'Session not found' });
  if (result.error) return res.status(400).json({ error: result.error });

  const comment = db.getComment(result.id) || result;
  broadcast(req.params.token, 'comment_created', { comment });
  broadcastAll('comment_created', { comment, sessionToken: req.params.token });
  res.status(201).json({ comment });
});

app.post('/api/comments/:id/replies', (req, res) => {
  const result = db.createReply(req.params.id, req.body || {});
  if (!result) return res.status(404).json({ error: 'Comment not found' });
  if (result.error) return res.status(400).json({ error: result.error });

  const session = db.listSessions().find(s => s.id === result.sessionId);
  if (session) {
    broadcast(session.token, 'reply_created', { reply: result, commentId: req.params.id });
    broadcastAll('reply_created', { reply: result, commentId: req.params.id, sessionToken: session.token });
  }
  res.status(201).json({ reply: result });
});

app.patch('/api/comments/:id', (req, res) => {
  const result = db.updateComment(req.params.id, req.body || {});
  if (!result) return res.status(404).json({ error: 'Comment not found' });
  if (result.error) return res.status(400).json({ error: result.error });

  const comment = result;
  const session = db.listSessions().find(s => s.id === comment.sessionId);
  if (session) {
    broadcast(session.token, 'comment_updated', { comment });
    broadcastAll('comment_updated', { comment, sessionToken: session.token });
  }
  res.json({ comment });
});

app.delete('/api/comments/:id', (req, res) => {
  const existing = db.getComment(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Comment not found' });

  const session = db.listSessions().find(s => s.id === existing.sessionId);
  db.deleteComment(req.params.id);

  if (session) {
    broadcast(session.token, 'comment_deleted', { commentId: req.params.id });
    broadcastAll('comment_deleted', { commentId: req.params.id, sessionToken: session.token });
  }
  res.json({ ok: true });
});

app.get('/api/sessions/:token/events', (req, res) => {
  const session = db.getSessionByToken(req.params.token);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  prepareEventStream(res);

  const token = req.params.token;
  if (!sseClients.has(token)) sseClients.set(token, new Set());
  sseClients.get(token).add(res);

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const set = sseClients.get(token);
    if (set) {
      set.delete(res);
      if (set.size === 0) sseClients.delete(token);
    }
  });
});

app.get('/api/page-comments', (req, res) => {
  const pagePath = pageCommentsDb.normalizePagePath(req.query.path || '/');
  res.json({ pagePath, comments: pageCommentsDb.listComments(pagePath) });
});

app.get('/api/page-comments/all', (_req, res) => {
  const comments = pageCommentsDb.listAllComments();
  const pages = {};

  comments.forEach(comment => {
    if (!pages[comment.pagePath]) {
      pages[comment.pagePath] = { pagePath: comment.pagePath, count: 0 };
    }
    pages[comment.pagePath].count += 1;
  });

  res.json({
    comments,
    pages: Object.values(pages).sort((a, b) => a.pagePath.localeCompare(b.pagePath))
  });
});

app.post('/api/page-comments', (req, res) => {
  const result = pageCommentsDb.createComment(req.body || {});
  if (result?.error) return res.status(400).json({ error: result.error });

  broadcastPageComment('comment_created', { comment: result });
  res.status(201).json({ comment: result });
});

app.delete('/api/page-comments/:id', (req, res) => {
  const existing = pageCommentsDb.getComment(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Comment not found' });

  pageCommentsDb.deleteComment(req.params.id);
  broadcastPageComment('comment_deleted', {
    commentId: req.params.id,
    pagePath: existing.pagePath
  });
  res.json({ ok: true });
});

app.get('/api/page-comments/events', (req, res) => {
  prepareEventStream(res);

  pageCommentSseClients.add(res);
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    pageCommentSseClients.delete(res);
  });
});

app.get('/api/admin/events', (req, res) => {
  prepareEventStream(res);

  const adminToken = '__admin__';
  if (!sseClients.has(adminToken)) sseClients.set(adminToken, new Set());
  sseClients.get(adminToken).add(res);

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const set = sseClients.get(adminToken);
    if (set) {
      set.delete(res);
      if (set.size === 0) sseClients.delete(adminToken);
    }
  });
});

app.use('/review', express.static(path.join(ROOT, 'review')));
app.use('/admin', express.static(path.join(ROOT, 'admin')));

app.get('/', redirectToDefaultReview, (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(ROOT, 'HomePage.html'));
});

app.get(['/HomePage.html', '/index.html'], redirectToDefaultReview, (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(ROOT, 'HomePage.html'));
});

const MODULE_PAGES = [
  'intercompany-control',
  'group-reporting',
  'group-planning'
];

MODULE_PAGES.forEach(slug => {
  app.get(`/modules/${slug}`, (_req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(ROOT, 'modules', `${slug}.html`));
  });
  app.get(`/modules/${slug}.html`, (_req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(ROOT, 'modules', `${slug}.html`));
  });
});

app.use(express.static(ROOT, { index: false }));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

function getLanAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

function onServerReady() {
  const portLabel = typeof PORT === 'number' ? PORT : 'pipe';
  console.log('');
  console.log('  GATHER.nexus preview + review server');
  console.log('  ------------------------------------');
  console.log(`  Homepage:  http://localhost:${portLabel}/`);
  console.log(`  Admin:     http://localhost:${portLabel}/admin/`);
  const lan = getLanAddress();
  if (lan && typeof PORT === 'number') {
    console.log(`  Network:   http://${lan}:${PORT}/  (share this with clients on your Wi-Fi)`);
  }
  if (process.env.PUBLIC_BASE_URL) {
    console.log(`  Public:    ${process.env.PUBLIC_BASE_URL}`);
  }
  console.log(`  Comments:  ${path.join(getDataDir(), 'review.db.json')}`);
  console.log('');
  const defaults = loadReviewDefaults();
  if (defaults) {
    const session = db.getSessionByToken(defaults.defaultReviewToken);
    if (session) {
      console.log('  Primary review link (saved for ongoing work):');
      console.log(`  http://localhost:${portLabel}${session.pagePath}?review=${session.token}`);
      if (lan && typeof PORT === 'number') {
        console.log(`  http://${lan}:${PORT}${session.pagePath}?review=${session.token}`);
      }
      console.log('');
    }
  }
  console.log('  Create a share link from Admin, then send the client URL with ?review=TOKEN');
  console.log('');
}

const server = typeof PORT === 'number'
  ? app.listen(PORT, HOST, onServerReady)
  : app.listen(PORT, onServerReady);

server.on('error', err => {
  console.error('[startup] listen failed on', HOST, PORT, err && err.stack ? err.stack : err);
  process.exit(1);
});

module.exports = { app, server, broadcast, broadcastAll };
