'use strict';

// Regression: offline review mode with saved comments must not trigger
// beforeunload on same-origin navigation (the "Leave site?" dialog).

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const REVIEW_JS_PATH = path.join(__dirname, '..', '..', 'review', 'review.js');
const reviewSource = fs.readFileSync(REVIEW_JS_PATH, 'utf8');

function jsonResponse(body, status) {
  var ok = !status || (status >= 200 && status < 300);
  return {
    ok: ok,
    status: status || 200,
    json: function () { return Promise.resolve(body); },
    text: function () { return Promise.resolve(JSON.stringify(body)); }
  };
}

function setupDom(options) {
  var token = options.token || 'testtoken';
  var dom = new JSDOM(
    '<!doctype html><html><body>' +
      '<section id="top"><h1>Home</h1></section>' +
      '<a id="nav-link" href="/about.html">About</a>' +
    '</body></html>',
    {
      url: 'https://gather-refreshment.vercel.app/index.html?review=' + token,
      pretendToBeVisual: true,
      runScripts: 'outside-only'
    }
  );

  var window = dom.window;
  window.fetch = function () {
    return Promise.reject(new Error('no-backend'));
  };
  window.HTMLElement.prototype.scrollIntoView = function () {};
  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = function () {
      this.observe = function () {};
      this.disconnect = function () {};
    };
  }

  return dom;
}

function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

test('beforeunload does not warn for offline comments on same-origin navigation', async function () {
  var token = 'offline-nav-test';
  var dom = setupDom({ token: token });
  var window = dom.window;

  window.localStorage.setItem('rv-offline-' + token, JSON.stringify({
    savedAt: new Date().toISOString(),
    comments: [{
      id: 'local-1',
      authorName: 'Tester',
      body: 'Saved offline comment',
      pagePath: '/index.html',
      status: 'open',
      replies: []
    }]
  }));

  window.eval(reviewSource);
  await wait(200);

  var prevented = false;
  window.addEventListener('beforeunload', function (e) {
    if (e.defaultPrevented) prevented = true;
    if (e.returnValue) prevented = true;
  });

  var link = window.document.getElementById('nav-link');
  link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

  var event = new window.Event('beforeunload', { cancelable: true });
  Object.defineProperty(event, 'returnValue', {
    configurable: true,
    writable: true,
    value: ''
  });
  window.dispatchEvent(event);

  assert.equal(prevented, false, 'same-origin navigation should not trigger leave warning');
});

test('beforeunload does not warn in offline mode even with an open comment draft', async function () {
  var token = 'offline-draft-test';
  var dom = setupDom({ token: token });
  var window = dom.window;

  window.document.elementFromPoint = function () {
    return window.document.querySelector('h1');
  };

  window.eval(reviewSource);
  await wait(200);

  var target = window.document.querySelector('h1');
  target.dispatchEvent(new window.MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: 20,
    clientY: 20
  }));

  var addBtn = window.document.getElementById('rv-add-comment');
  assert.ok(addBtn, 'right-click should open the add-comment menu');
  addBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

  await wait(30);
  var draftPopover = window.document.getElementById('rv-popover');
  assert.ok(draftPopover, 'draft popover should open after choosing Add comment here');

  var bodyInput = draftPopover.querySelector('textarea[name="body"]');
  assert.ok(bodyInput, 'draft form should include a comment body field');
  bodyInput.value = 'Client feedback from right-click';

  var event = new window.Event('beforeunload', { cancelable: true });
  var returnValue = '';
  Object.defineProperty(event, 'returnValue', {
    configurable: true,
    get: function () { return returnValue; },
    set: function (v) { returnValue = v; }
  });
  window.dispatchEvent(event);

  assert.equal(returnValue, '', 'offline mode should never block navigation');
});

test('beforeunload does not warn for stale persisted composer drafts on other pages', async function () {
  var token = 'stale-draft-test';
  var dom = setupDom({ token: token });
  var window = dom.window;

  window.localStorage.setItem('rv-composer-draft-' + token, JSON.stringify({
    savedAt: new Date().toISOString(),
    pagePath: '/other-page.html',
    draft: { body: 'Draft from another page', author: 'Tester' }
  }));

  window.eval(reviewSource);
  await wait(200);

  var event = new window.Event('beforeunload', { cancelable: true });
  var returnValue = '';
  Object.defineProperty(event, 'returnValue', {
    configurable: true,
    get: function () { return returnValue; },
    set: function (v) { returnValue = v; }
  });
  window.dispatchEvent(event);

  assert.equal(returnValue, '', 'stale cross-page drafts should not trigger leave warning');
});
