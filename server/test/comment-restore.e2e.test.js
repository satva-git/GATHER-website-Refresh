'use strict';

/**
 * Durability scenario covering the client merge/restore contract:
 * 40 synced comments (+ replies) + 2 local-only → server empty → restore 42.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function mergeCommentLists(serverList, localList, deletedIds) {
  const deleted = {};
  (deletedIds || []).forEach(id => { deleted[id] = true; });
  const byId = {};

  (localList || []).forEach(c => {
    if (!c || !c.id || deleted[c.id]) return;
    byId[c.id] = { ...c, _pendingSync: c._pendingSync || 'create' };
  });

  (serverList || []).forEach(c => {
    if (!c || !c.id || deleted[c.id]) return;
    const local = byId[c.id];
    if (!local) {
      byId[c.id] = { ...c, _pendingSync: false };
      return;
    }
    const serverTime = c.updatedAt || c.createdAt || '';
    const localTime = local.updatedAt || local.createdAt || '';
    byId[c.id] = serverTime >= localTime
      ? {
          ...c,
          replies: (c.replies && c.replies.length) ? c.replies : (local.replies || []),
          _pendingSync: false
        }
      : {
          ...local,
          replies: (local.replies && local.replies.length) ? local.replies : (c.replies || []),
          _pendingSync: 'update'
        };
  });

  const serverEmpty = !serverList || serverList.length === 0;
  Object.keys(byId).forEach(id => {
    const onServer = (serverList || []).some(c => c.id === id);
    if (onServer) return;
    const comment = byId[id];
    if (comment._pendingSync === 'create' || comment._pendingSync === 'update') return;
    if (String(id).indexOf('local-') === 0 || serverEmpty) {
      comment._pendingSync = 'create';
    }
  });

  return Object.values(byId);
}

describe('Comment wipe/restore durability', () => {
  it('restores 40 comments + 2 local with replies after empty server', () => {
    const serverComments = [];
    for (let i = 0; i < 40; i++) {
      serverComments.push({
        id: 'srv-' + i,
        body: 'Comment #' + (i + 1),
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:' + String(i).padStart(2, '0') + '.000Z',
        updatedAt: '2026-01-01T00:00:' + String(i).padStart(2, '0') + '.000Z',
        replies: i < 5
          ? [{ id: 'r-' + i, body: 'Reply ' + i, authorName: 'Designer', createdAt: '2026-01-01T01:00:00.000Z' }]
          : []
      });
    }

    // Browser still has full backup + 2 offline comments after server wipe.
    const localBackup = serverComments.map(c => ({ ...c, replies: (c.replies || []).slice() }));
    localBackup.push({
      id: 'local-extra-1',
      body: 'Offline extra 1',
      authorName: 'Client',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      replies: [{ id: 'local-r1', body: 'Nested offline reply', authorName: 'Client', createdAt: '2026-01-02T00:01:00.000Z' }],
      _pendingSync: 'create'
    });
    localBackup.push({
      id: 'local-extra-2',
      body: 'Offline extra 2',
      authorName: 'Client',
      createdAt: '2026-01-02T00:02:00.000Z',
      updatedAt: '2026-01-02T00:02:00.000Z',
      replies: [],
      _pendingSync: 'create'
    });

    const wipedServer = [];
    const restored = mergeCommentLists(wipedServer, localBackup, []);
    const replyCount = restored.reduce((n, c) => n + ((c.replies || []).length), 0);

    assert.equal(restored.length, 42);
    assert.equal(replyCount, 6); // 5 server replies + 1 local nested
    assert.ok(restored.every(c => c._pendingSync === 'create'));

    console.log('Restored ' + restored.length + ' comments, ' + replyCount + ' replies');
  });
});
