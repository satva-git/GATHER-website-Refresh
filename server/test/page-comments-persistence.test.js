'use strict';

/**
 * Test page comment persistence across pages
 * - Comments should be stored with pagePath
 * - Navigating to different pages should load page-specific comments
 * - Server should handle batch upsert from client
 * - Comments should persist between navigation
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Mock the page-comments-db module behavior
function mockPageCommentsDb() {
  const data = { comments: [] };
  
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
  
  function upsertComments(pagePath, comments) {
    const normalizedPath = normalizePagePath(pagePath);
    const results = [];
    
    (comments || []).forEach(comment => {
      if (!comment || !comment.id) return;
      
      const existingIndex = data.comments.findIndex(c => c.id === comment.id);
      
      if (existingIndex >= 0) {
        const existing = data.comments[existingIndex];
        Object.assign(existing, {
          body: comment.body,
          authorName: comment.authorName,
          updatedAt: new Date().toISOString(),
          status: comment.status || existing.status,
          replies: comment.replies || existing.replies,
          reactions: comment.reactions || existing.reactions,
          anchor: comment.anchor || existing.anchor,
          label: comment.label || existing.label,
          pinX: comment.pinX !== undefined ? comment.pinX : existing.pinX,
          pinY: comment.pinY !== undefined ? comment.pinY : existing.pinY
        });
        results.push(existing);
      } else {
        const newComment = {
          id: comment.id,
          pagePath: normalizedPath,
          body: comment.body,
          authorName: comment.authorName,
          createdAt: comment.createdAt || new Date().toISOString(),
          updatedAt: comment.updatedAt || new Date().toISOString(),
          status: comment.status || 'open',
          pinX: comment.pinX,
          pinY: comment.pinY,
          anchor: comment.anchor,
          label: comment.label,
          replies: comment.replies || [],
          reactions: comment.reactions || {}
        };
        data.comments.push(newComment);
        results.push(newComment);
      }
    });
    
    return results;
  }
  
  return {
    normalizePagePath,
    listComments,
    upsertComments,
    data
  };
}

describe('Page comments persistence across pages', () => {
  
  it('stores comments with pagePath and retrieves only page-specific comments', () => {
    const db = mockPageCommentsDb();
    
    // Add comment to home page
    const homeComments = db.upsertComments('/index.html', [
      {
        id: 'home-1',
        body: 'Home page comment',
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinX: 0.5,
        pinY: 0.3
      }
    ]);
    
    // Add comment to module page
    const moduleComments = db.upsertComments('/modules/group-reporting.html', [
      {
        id: 'module-1',
        body: 'Module page comment',
        authorName: 'Client',
        createdAt: '2026-01-01T00:01:00.000Z',
        updatedAt: '2026-01-01T00:01:00.000Z',
        pinX: 0.4,
        pinY: 0.2
      }
    ]);
    
    // Verify comments are stored with correct pagePath
    assert.equal(homeComments[0].pagePath, '/index.html');
    assert.equal(moduleComments[0].pagePath, '/modules/group-reporting.html');
    
    // Verify loading home comments only shows home comment
    const homeListing = db.listComments('/index.html');
    assert.equal(homeListing.length, 1);
    assert.equal(homeListing[0].id, 'home-1');
    assert.equal(homeListing[0].body, 'Home page comment');
    
    // Verify loading module comments only shows module comment
    const moduleListing = db.listComments('/modules/group-reporting.html');
    assert.equal(moduleListing.length, 1);
    assert.equal(moduleListing[0].id, 'module-1');
    assert.equal(moduleListing[0].body, 'Module page comment');
  });
  
  it('handles batch upsert from client with multiple comments per page', () => {
    const db = mockPageCommentsDb();
    
    // Simulate client sending batch of comments for one page
    const comments = [
      {
        id: 'c1',
        body: 'First comment',
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinX: 0.1,
        pinY: 0.1
      },
      {
        id: 'c2',
        body: 'Second comment',
        authorName: 'Client',
        createdAt: '2026-01-01T00:01:00.000Z',
        updatedAt: '2026-01-01T00:01:00.000Z',
        pinX: 0.5,
        pinY: 0.5
      }
    ];
    
    const results = db.upsertComments('/index.html', comments);
    assert.equal(results.length, 2);
    
    const listing = db.listComments('/index.html');
    assert.equal(listing.length, 2);
    assert.equal(listing[0].body, 'First comment');
    assert.equal(listing[1].body, 'Second comment');
  });
  
  it('updates existing comments when upserting same page', () => {
    const db = mockPageCommentsDb();
    
    // Initial insert
    db.upsertComments('/index.html', [
      {
        id: 'c1',
        body: 'Original comment',
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinX: 0.5,
        pinY: 0.5,
        replies: []
      }
    ]);
    
    // Update same comment
    const updated = db.upsertComments('/index.html', [
      {
        id: 'c1',
        body: 'Updated comment',
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:02:00.000Z',
        pinX: 0.5,
        pinY: 0.5,
        replies: [
          {
            id: 'r1',
            body: 'A reply',
            authorName: 'Designer',
            createdAt: '2026-01-01T00:01:00.000Z'
          }
        ]
      }
    ]);
    
    assert.equal(updated.length, 1);
    const listing = db.listComments('/index.html');
    assert.equal(listing.length, 1);
    assert.equal(listing[0].body, 'Updated comment');
    assert.equal(listing[0].replies.length, 1);
    assert.equal(listing[0].replies[0].body, 'A reply');
  });
  
  it('normalizes page paths correctly', () => {
    const db = mockPageCommentsDb();
    
    // Add comment with non-normalized path
    db.upsertComments('index.html', [
      {
        id: 'c1',
        body: 'Test',
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinX: 0.5,
        pinY: 0.5
      }
    ]);
    
    // Should be normalized to /index.html
    assert.equal(db.data.comments[0].pagePath, '/index.html');
    
    // Loading with non-normalized path should still work
    const listing = db.listComments('index.html');
    assert.equal(listing.length, 1);
  });
  
  it('preserves pinX/pinY when updating comments', () => {
    const db = mockPageCommentsDb();
    
    // Initial insert with pin position
    db.upsertComments('/index.html', [
      {
        id: 'c1',
        body: 'Test',
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        pinX: 0.3,
        pinY: 0.7
      }
    ]);
    
    // Update comment (client might not send pinX/pinY on update)
    const updated = db.upsertComments('/index.html', [
      {
        id: 'c1',
        body: 'Updated test',
        authorName: 'Client',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:05:00.000Z'
      }
    ]);
    
    // pinX/pinY should be preserved
    assert.equal(updated[0].pinX, 0.3);
    assert.equal(updated[0].pinY, 0.7);
  });
});
