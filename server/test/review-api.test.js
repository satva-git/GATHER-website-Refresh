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
    delete process.env.DATABASE_URL;
    delete process.env.REVIEW_DATABASE_URL;

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

  it('stores pagePath on module-page comments', async () => {
    const createRes = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: 'Module Reviewer',
      body: 'Intercompany hero spacing',
      pagePath: '/modules/intercompany-control.html',
      sectionId: 'mod-hero',
      sectionLabel: 'Hero',
      pinX: 0.4,
      pinY: 0.25
    });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.json.comment.pagePath, '/modules/intercompany-control');
  });

  it('persists element anchors for sticky pin placement', async () => {
    const createRes = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: 'Anchor Reviewer',
      body: 'This title needs more contrast',
      sectionId: 'pricing',
      sectionLabel: 'Pricing',
      pinX: 0.5,
      pinY: 0.4,
      anchor: {
        selector: '#pricing h2',
        elementId: null,
        textHint: 'Pricing',
        tagName: 'H2',
        sectionId: 'pricing',
        offsetX: 0.12,
        offsetY: 0.4
      }
    });
    assert.equal(createRes.status, 201);
    assert.ok(createRes.json.comment.anchor);
    assert.equal(createRes.json.comment.anchor.selector, '#pricing h2');
    assert.equal(createRes.json.comment.anchor.offsetX, 0.12);
    assert.equal(createRes.json.comment.anchor.textHint, 'Pricing');

    const listRes = await request(baseUrl, 'GET', `/api/sessions/${sessionToken}/comments`);
    const saved = listRes.json.comments.find(c => c.id === createRes.json.comment.id);
    assert.ok(saved);
    assert.equal(saved.anchor.selector, '#pricing h2');
  });

  it('redirects module pages to default review token', async () => {
    const res = await request(baseUrl, 'GET', '/modules/group-reporting');
    assert.equal(res.status, 302);
    assert.match(String(res.headers.location || ''), /review=/);
  });

  it('supports pin and reaction endpoints', async () => {
    const createRes = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/comments`, {
      authorName: 'Reactor',
      body: 'Pin me',
      pinX: 0.1,
      pinY: 0.1
    });
    assert.equal(createRes.status, 201);
    const id = createRes.json.comment.id;

    const pinRes = await request(baseUrl, 'POST', `/api/comments/${id}/pin`, { pinned: true });
    assert.equal(pinRes.status, 200);
    assert.equal(pinRes.json.pinned, true);

    const reactRes = await request(
      baseUrl,
      'POST',
      `/api/comments/${id}/reactions/${encodeURIComponent('👍')}`,
      {}
    );
    assert.equal(reactRes.status, 200);
    assert.ok(reactRes.json.comment.reactions['👍'] >= 1);

    const delRes = await request(
      baseUrl,
      'DELETE',
      `/api/comments/${id}/reactions/${encodeURIComponent('👍')}`
    );
    assert.equal(delRes.status, 200);
  });

  it('claims first user as session owner', async () => {
    const claim = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/claim-owner`, {
      userId: 'owner-user-1'
    });
    assert.equal(claim.status, 200);
    assert.equal(claim.json.session.ownerUserId, 'owner-user-1');
    assert.equal(claim.json.isOwner, true);

    const second = await request(baseUrl, 'POST', `/api/sessions/${sessionToken}/claim-owner`, {
      userId: 'other-user'
    });
    assert.equal(second.status, 200);
    assert.equal(second.json.session.ownerUserId, 'owner-user-1');
    assert.equal(second.json.isOwner, false);
  });
});
