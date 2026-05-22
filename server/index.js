'use strict';

const express = require('express');
const path = require('path');
const db = require('./db');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
app.use(express.json({ limit: '64kb' }));

/** @type {Map<string, Set<import('http').ServerResponse>>} */
const sseClients = new Map();

function getBaseUrl(req) {
  const proto = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('x-forwarded-host') || req.get('host');
  return `${proto}://${host}`;
}

function broadcast(sessionToken, event, payload) {
  const clients = sseClients.get(sessionToken);
  if (!clients || clients.size === 0) return;
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    res.write(message);
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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
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

  broadcast(req.params.token, 'comment_created', { comment: result });
  broadcastAll('comment_created', { comment: result, sessionToken: req.params.token });
  res.status(201).json({ comment: result });
});

app.patch('/api/comments/:id', (req, res) => {
  const comment = db.updateComment(req.params.id, req.body || {});
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

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

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

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

app.get('/api/admin/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

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

app.get('/', (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.sendFile(path.join(ROOT, 'HomePage.html'));
});

app.get(['/HomePage.html', '/index.html'], (_req, res) => {
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

const server = app.listen(PORT, HOST, () => {
  console.log('');
  console.log('  GATHER.nexus preview + review server');
  console.log('  ------------------------------------');
  console.log(`  Homepage:  http://localhost:${PORT}/`);
  console.log(`  Admin:     http://localhost:${PORT}/admin/`);
  console.log('');
  console.log('  Create a share link from Admin, then send the client URL with ?review=TOKEN');
  console.log('');
});

module.exports = { app, server, broadcast, broadcastAll };
