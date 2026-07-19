'use strict';

// Regression test for the "comment marker shakes continuously and the
// comment box never opens" bug. Root cause: renderPins() rebuilding pin DOM
// nodes in response to MutationObserver/ResizeObserver callbacks that were
// themselves triggered by that same rebuild (and by ordinary page churn),
// so a pin could be destroyed and recreated out from under a user's click
// before the browser ever dispatched a click event on it.
//
// This test boots the *real* review/review.js inside a jsdom window, wires
// up a fake backend via a `fetch` stub, and then simulates a runaway DOM
// mutation storm (standing in for the feedback loop / any future regression
// that reintroduces one) happening concurrently with user interaction. It
// asserts that:
//   1. Clicking an existing pin still opens its thread popover.
//   2. The popover is not torn down by ongoing, unrelated DOM churn.
//   3. The full "Add Comment" flow (context menu -> draft -> submit) still
//      completes and results in a persisted, stable, open thread — even
//      under the same churn.
//   4. The pin relayout circuit breaker actually engages if the rebuild
//      rate is pushed high enough to look like the original bug.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const REVIEW_JS_PATH = path.join(__dirname, '..', '..', 'review', 'review.js');
const reviewSource = fs.readFileSync(REVIEW_JS_PATH, 'utf8');

function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function jsonResponse(body, status) {
  var ok = !status || (status >= 200 && status < 300);
  return {
    ok: ok,
    status: status || 200,
    json: function () { return Promise.resolve(body); },
    text: function () { return Promise.resolve(JSON.stringify(body)); }
  };
}

// Minimal fake backend: comments live in the `comments` array passed in,
// mutated in place so the test can assert on what got persisted.
function buildFetchStub(comments) {
  var nextId = 100;
  return function fetchStub(url, options) {
    var method = (options && options.method) || 'GET';
    var u = String(url);

    if (u.indexOf('/api/sessions/') !== -1 && u.indexOf('/comments') !== -1 && method === 'GET') {
      return Promise.resolve(jsonResponse({ comments: comments }));
    }
    if (u.indexOf('/api/sessions/') !== -1 && u.indexOf('/comments') !== -1 && method === 'POST') {
      var body = JSON.parse(options.body);
      var comment = Object.assign({
        id: 'srv-' + (nextId++),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'open',
        replies: []
      }, body);
      comments.push(comment);
      return Promise.resolve(jsonResponse({ comment: comment }));
    }
    if (u.indexOf('/api/sessions/') !== -1 && method === 'GET') {
      return Promise.resolve(jsonResponse({ session: { token: 'testtoken', title: 'Test Review' } }));
    }
    // claim-owner, reactions, pins, etc. — fine to no-op for this test.
    return Promise.resolve(jsonResponse({}));
  };
}

function setupDom(comments) {
  var dom = new JSDOM(
    '<!doctype html><html><body>' +
      '<section id="top"><h1 id="hero-heading">Hero heading</h1></section>' +
      '<section id="the-solution">' +
        '<h2 id="target-heading">Target heading for anchor</h2>' +
        '<p id="target-para">Some paragraph text used as the add-comment click target.</p>' +
      '</section>' +
    '</body></html>',
    {
      url: 'https://example.test/index.html?review=testtoken',
      pretendToBeVisual: true,
      runScripts: 'outside-only'
    }
  );

  var window = dom.window;
  window.fetch = buildFetchStub(comments);
  // jsdom has no real layout/hit-testing engine.
  window.document.elementFromPoint = function () {
    return window.document.getElementById('target-para');
  };
  window.HTMLElement.prototype.scrollIntoView = function () {};
  if (typeof window.PointerEvent === 'undefined') {
    window.PointerEvent = window.MouseEvent;
  }
  if (typeof window.ResizeObserver === 'undefined') {
    // Not exercised directly by this test, but keep review.js from throwing
    // if it ever assumes the constructor exists once `typeof` is truthy.
    window.ResizeObserver = function () { this.observe = function () {}; this.disconnect = function () {}; };
  }

  // jsdom does not implement the standard HTMLFormElement named-property
  // access (e.g. `form.author` for `<input name="author">`), unlike every
  // real browser. review.js correctly relies on that spec'd behavior, so
  // shim it here (test-environment-only) rather than changing production
  // code to work around a jsdom gap.
  function definedNamedFormAccessor(form, name, el) {
    Object.defineProperty(form, name, { configurable: true, get: function () { return el; } });
  }
  window.document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.elements) return;
    for (var i = 0; i < form.elements.length; i++) {
      var el = form.elements[i];
      if (el.name && !(el.name in form)) definedNamedFormAccessor(form, el.name, el);
    }
  }, true);

  return dom;
}

function fireMouse(window, el, type, x, y, extra) {
  var opts = Object.assign({ bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 }, extra || {});
  el.dispatchEvent(new window.MouseEvent(type, opts));
}

function startChurn(window) {
  var decoy = window.document.createElement('div');
  decoy.id = 'churn-decoy';
  window.document.body.appendChild(decoy);
  var ticks = 0;
  var timer = setInterval(function () {
    // Real-world equivalent: a third-party script, ad slot, or any future
    // regression mutating unrelated DOM rapidly while the user is mid-click.
    decoy.classList.toggle('churn');
    ticks++;
  }, 20);
  return {
    stop: function () { clearInterval(timer); },
    ticks: function () { return ticks; }
  };
}

test('clicking an existing comment pin opens its popover and it survives a DOM-churn storm', async function () {
  var comments = [{
    id: 'c1',
    authorName: 'Alice',
    body: 'Please fix this heading.',
    pagePath: '/',
    sectionId: 'the-solution',
    sectionLabel: 'The Solution',
    tabId: 'default',
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: [],
    anchor: {
      elementId: 'target-heading',
      selector: '#target-heading',
      tagName: 'H2',
      offsetX: 0.5,
      offsetY: 0.5
    }
  }];

  var dom = setupDom(comments);
  var window = dom.window;
  var churn = null;
  try {
    window.eval(reviewSource);

    await wait(120); // let bootstrap -> loadSession -> loadComments -> renderAll settle

    var pin = window.document.querySelector('.rv-pin[data-comment-id="c1"]');
    assert.ok(pin, 'expected a pin to be rendered for the existing comment');

    churn = startChurn(window);

    fireMouse(window, pin, 'pointerdown', 10, 10);

    await wait(50);
    var popover = window.document.getElementById('rv-thread-popover');
    assert.ok(popover, 'popover should open right away on pointerdown');

    // Outlive the relayout debounce window (120ms) several times over while
    // churn keeps mutating the page.
    await wait(900);
    popover = window.document.getElementById('rv-thread-popover');
    assert.ok(popover, 'popover must still be open after sustained unrelated DOM churn');
    assert.ok(churn.ticks() > 15, 'sanity check: the churn actually ran while we waited');
  } finally {
    if (churn) churn.stop();
    window.close();
  }
});

test('Add Comment flow (context menu -> draft -> submit) persists and opens a stable thread under churn', async function () {
  var comments = [];
  var dom = setupDom(comments);
  var window = dom.window;
  var churn = null;
  try {
    window.eval(reviewSource);

    await wait(120);

    var target = window.document.getElementById('target-para');
    fireMouse(window, target, 'contextmenu', 20, 20);

    var addBtn = window.document.getElementById('rv-add-comment');
    assert.ok(addBtn, 'context menu should offer "Add comment here"');
    fireMouse(window, addBtn, 'click', 20, 20);

    await wait(30);
    var draftPopover = window.document.getElementById('rv-popover');
    assert.ok(draftPopover, 'draft popover should appear after choosing Add comment here');

    var authorInput = draftPopover.querySelector('input[name="author"]');
    var bodyInput = draftPopover.querySelector('textarea[name="body"]');
    assert.ok(authorInput && bodyInput, 'draft form should have author + body fields');
    authorInput.value = 'QA Bot';
    bodyInput.value = 'This is an automated regression-test comment.';

    churn = startChurn(window);

    var form = draftPopover.querySelector('#rv-popover-form');
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

    await wait(150);

    assert.equal(comments.length, 1, 'the new comment should have been persisted through the API');
    var popover = window.document.getElementById('rv-thread-popover');
    assert.ok(popover, 'after posting, the new comment thread should open automatically');

    await wait(700);
    assert.ok(
      window.document.getElementById('rv-thread-popover'),
      'the newly created thread must remain open under continued DOM churn'
    );
  } finally {
    if (churn) churn.stop();
    window.close();
  }
});

test('pin relayout circuit breaker self-heals when something calls renderPins() in a tight loop', async function () {
  var comments = [{
    id: 'c1',
    authorName: 'Alice',
    body: 'Comment for breaker test.',
    pagePath: '/',
    sectionId: 'the-solution',
    sectionLabel: 'The Solution',
    tabId: 'default',
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: [],
    anchor: { elementId: 'target-heading', selector: '#target-heading', tagName: 'H2', offsetX: 0.5, offsetY: 0.5 }
  }];

  var dom = setupDom(comments);
  var window = dom.window;
  // Opt in to the test-only introspection hook (must be set *before* eval).
  window.__RV_TEST_HOOKS__ = {};

  try {
    var warnings = [];
    var originalWarn = window.console.warn;
    window.console.warn = function () {
      warnings.push(Array.prototype.slice.call(arguments).join(' '));
      return originalWarn.apply(window.console, arguments);
    };

    window.eval(reviewSource);
    await wait(120);

    var hooks = window.__RV_TEST_HOOKS__;
    assert.ok(hooks && typeof hooks.renderPins === 'function', 'test hook should expose renderPins');

    // Simulate the *exact* original bug: something calling renderPins()
    // back-to-back with no debounce at all (e.g. a future regression that
    // bypasses schedulePinRelayout entirely). This must trip the breaker
    // near-instantly rather than shaking indefinitely.
    for (var i = 0; i < 5; i++) {
      hooks.renderPins();
    }

    assert.ok(
      warnings.some(function (w) { return w.indexOf('pin relayout loop detected') !== -1; }),
      'the circuit breaker should have logged a warning once renderPins() was called in a tight loop'
    );

    // The page must still be usable afterwards: a pin should exist and still
    // be clickable once the breaker's cool-down elapses.
    await wait(4200);
    var pin = window.document.querySelector('.rv-pin[data-comment-id="c1"]');
    assert.ok(pin, 'pins should still render normally once the breaker cools down');

    fireMouse(window, pin, 'pointerdown', 5, 5);
    await wait(50);
    assert.ok(window.document.getElementById('rv-thread-popover'), 'clicking should still open the popover after recovery');
  } finally {
    window.close();
  }
});
