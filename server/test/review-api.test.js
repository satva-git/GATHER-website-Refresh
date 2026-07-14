'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const http = require('http');

const TEST_DB_DIR = path.join(__dirname, '..', 'data-test');
const TEST_DB_PATH = path.join(TEST_DB_DIR, 'review.db.json');

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function request(baseUrl, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, baseUrl);
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      url,
      {
        method,
        headers: body
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          : {}
      },
      res => {
        let raw = '';
        res.on('data', chunk => {
          raw += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch (err) {
            json = raw;
          }
          resolve({ status: res.statusCode, json, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('Review API integration', () => {
  let server;
  let baseUrl;
  let sessionToken;

  before(async () => {
    rmDir(TEST_DB_DIR);
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
    process.env.REVIEW_DB_PATH = TEST_DB_PATH;

    process.env.PORT = '0';

    delete require.cache[require.resolve('../db.js')];
    delete require.cache[require.resolve('../page-comments-db.js')];
    delete require.cache[require.resolve('../index.js')];

    const mod = require('../index.js');
    await mod.ready;
    server = mod.server;

    await new Promise(resolve => {
      if (server.listening) return resolve();
      server.on('listening', resolve);
    });

    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    if (server) server.close();
    rmDir(TEST_DB_DIR);
    delete process.env.REVIEW_DB_PATH;
  });

  it('health check responds ok', async () => {
    const res = await request(baseUrl, 'GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.json.ok, true);
  });

  it('creates a review session with share URL', async () => {
    const res = await request(baseUrl, 'POST', '/api/sessions', {
      title: 'Test review',
      pagePath: '/'
    });
    assert.equal(res.status, 201);
    assert.ok(res.json.session.token);
    assert.ok(res.json.shareUrl.includes('?review='));
    sessionToken = res.json.session.token;
  });

  it('rejects empty comments', async () => {
    const res = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: '',
      body: ''
    });
    assert.equal(res.status, 400);
  });

  it('stores and lists comments', async () => {
    const createRes = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: 'Client User',
      body: 'Please adjust pricing headline',
      sectionId: 'pricing',
      sectionLabel: 'Pricing',
      scrollY: 1200,
      pinX: 0.42,
      pinY: 0.55
    });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.json.comment.authorName, 'Client User');

    const listRes = await request(baseUrl, 'GET', `/api/sessions/${sessionToken}/comments`);
    assert.equal(listRes.status, 200);
    assert.equal(listRes.json.comments.length, 1);
    assert.equal(listRes.json.comments[0].body, 'Please adjust pricing headline');
  });

  it('updates and deletes comments', async () => {
    const listRes = await request(baseUrl, 'GET', `/api/sessions/${sessionToken}/comments`);
    const commentId = listRes.json.comments[0].id;

    const patchRes = await request(baseUrl, 'PATCH', `/api/comments/${commentId}`, {
      status: 'resolved'
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.json.comment.status, 'resolved');

    const deleteRes = await request(baseUrl, 'DELETE', `/api/comments/${commentId}`);
    assert.equal(deleteRes.status, 200);

    const afterRes = await request(baseUrl, 'GET', `/api/sessions/${sessionToken}/comments`);
    assert.equal(afterRes.json.comments.length, 0);
  });

  it('persists data to disk without loss', async () => {
    const createRes = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: 'Persistence Test',
      body: 'Should survive reload',
      sectionId: 'faq',
      sectionLabel: 'FAQ'
    });
    assert.equal(createRes.status, 201);

    assert.ok(fs.existsSync(TEST_DB_PATH));
    const raw = fs.readFileSync(TEST_DB_PATH, 'utf8');
    const saved = JSON.parse(raw);
    assert.ok(saved.comments.some(c => c.body === 'Should survive reload'));
  });

  it('returns 404 for invalid session token', async () => {
    const res = await request(baseUrl, 'GET', '/api/sessions/not-a-real-token/comments');
    assert.equal(res.status, 404);
  });

  it('updates comment body and rejects empty text', async () => {
    const createRes = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: 'Editor',
      body: 'Original text',
      pinX: 0.3,
      pinY: 0.3
    });
    assert.equal(createRes.status, 201);
    const commentId = createRes.json.comment.id;

    const patchRes = await request(baseUrl, 'PATCH', `/api/comments/${commentId}`, {
      body: 'Updated text'
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.json.comment.body, 'Updated text');

    const emptyRes = await request(baseUrl, 'PATCH', `/api/comments/${commentId}`, {
      body: '   '
    });
    assert.equal(emptyRes.status, 400);
  });

  it('creates and lists thread replies', async () => {
    const createRes = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: 'Client',
      body: 'Needs a reply',
      pinX: 0.2,
      pinY: 0.2
    });
    assert.equal(createRes.status, 201);
    const commentId = createRes.json.comment.id;

    const replyRes = await request(baseUrl, 'POST', `/api/comments/${commentId}/replies`, {
      authorName: 'Designer',
      body: 'Will fix this today'
    });
    assert.equal(replyRes.status, 201);
    assert.equal(replyRes.json.reply.body, 'Will fix this today');

    const listRes = await request(baseUrl, 'GET', `/api/sessions/${sessionToken}/comments`);
    const saved = listRes.json.comments.find(c => c.id === commentId);
    assert.ok(saved);
    assert.equal(saved.replies.length, 1);
  });
});
