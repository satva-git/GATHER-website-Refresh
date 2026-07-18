(function () {
  'use strict';

  var SECTIONS_V1 = [
    { id: 'top', label: 'Hero / Top' },
    { id: 'product-journey', label: 'Product Journey' },
    { id: 'the-problem', label: 'Platform Overview' },
    { id: 'the-solution', label: 'The Solution' },
    { id: 'intercompany-control', label: 'Intercompany Control' },
    { id: 'group-reporting', label: 'Group Reporting' },
    { id: 'group-planning', label: 'Group Planning' },
    { id: 'gather-difference', label: 'The GATHER Difference' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' }
  ];

  /* hex = pin/marker accent (medium pastel, visible on page canvas)
     light = very light tint used for popover/card backgrounds
     text = darker saturated shade of the same hue for readable accent text */
  var COMMENT_COLORS = [
    { name: 'Teal', hex: '#5fa895', light: '#eef8f5', text: '#2f7d68' },
    { name: 'Blue', hex: '#6b9bd1', light: '#eef4fc', text: '#3f6fad' },
    { name: 'Lavender', hex: '#9b8ad4', light: '#f4f1fb', text: '#6f5bb5' },
    { name: 'Rose', hex: '#d98ca6', light: '#fdf1f5', text: '#b15c7c' },
    { name: 'Amber', hex: '#d9a15b', light: '#fcf5ea', text: '#a8722c' },
    { name: 'Sage', hex: '#7fb08a', light: '#f0f8f1', text: '#4c8a5c' },
    { name: 'Coral', hex: '#dd8f80', light: '#fdf1ee', text: '#b15d4c' },
    { name: 'Periwinkle', hex: '#8b9fd9', light: '#f1f3fc', text: '#5568b0' },
    { name: 'Aqua', hex: '#6fb3b8', light: '#eef8f8', text: '#3d8a90' },
    { name: 'Mauve', hex: '#c48ab0', light: '#faf0f6', text: '#9c5580' }
  ];

  function humanizeSectionId(id) {
    return String(id || '')
      .replace(/^step-/, '')
      .replace(/^mod-/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (ch) { return ch.toUpperCase(); })
      .trim() || 'General';
  }

  function humanizeTabId(id) {
    if (!id || id === 'default') return 'General';
    // Handle tab IDs like "journey-panel-overview", "pillar-0", etc.
    return String(id)
      .replace(/^journey-panel-/, '')
      .replace(/^pillar-/, 'Pillar ')
      .replace(/^pillars-/, '')
      .replace(/^journey-/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, function (ch) { return ch.toUpperCase(); })
      .trim() || 'General';
  }

  function normalizeClientPagePath(pathname) {
    var value = String(pathname || '/').split('?')[0].split('#')[0];
    if (!value.startsWith('/')) value = '/' + value;
    if (value === '/index.html' || value === '/HomePage.html') return '/';
    var moduleMatch = value.match(/^\/modules\/([^/]+?)(?:\.html)?\/?$/);
    if (moduleMatch) return '/modules/' + moduleMatch[1];
    return value.replace(/\/$/, '') || '/';
  }

  function getCurrentPagePath() {
    return normalizeClientPagePath(window.location.pathname);
  }

  function detectSections() {
    var found = [];
    var seen = {};
    document.querySelectorAll('section[id]').forEach(function (el) {
      if (!el.id || seen[el.id]) return;
      seen[el.id] = true;
      var heading = el.querySelector('h1, h2, .h1, .h2');
      var label = heading
        ? heading.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)
        : humanizeSectionId(el.id);
      found.push({ id: el.id, label: label || humanizeSectionId(el.id) });
    });
    if (found.length) return found;
    return SECTIONS_V1;
  }

  var REVIEW_UI_SELECTOR = [
    '#rv-root',
    '#rv-panel',
    '#rv-popover',
    '#rv-thread-popover',
    '#rv-pending-pin',
    '.rv-pin',
    '.rv-add-hint',
    '.rv-context-menu',
    '.rv-tooltip',
    '#rv-confirm',
    '#rv-panel-backdrop',
    '#rv-thread-backdrop'
  ].join(',');

  var EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '✨', '🚀'];

  var TEAM_MEMBERS = [
    { name: 'Diana', id: 'diana' },
    { name: 'Josh', id: 'josh' },
    { name: 'Sarah', id: 'sarah' },
    { name: 'Mike', id: 'mike' },
    { name: 'Lisa', id: 'lisa' }
  ];

  var DEFAULT_STATIC_TOKEN = 'gather-static-review';

  function isStaticHost() {
    var host = window.location.hostname;
    return host.endsWith('github.io') ||
      window.location.protocol === 'file:';
  }

  function ensureReviewQuery(token) {
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.get('review') === token) return;
      url.searchParams.set('review', token);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (e) {}
  }

  function preserveReviewOnLinks(token) {
    function rewrite(anchor) {
      if (!anchor || !anchor.getAttribute) return;
      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 ||
          href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) {
        return;
      }
      try {
        var url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.searchParams.get('review') === token) return;
        url.searchParams.set('review', token);
        var next = url.pathname + url.search + url.hash;
        // Prefer relative-looking hrefs when the original was relative.
        if (href.indexOf('http') !== 0 && href.charAt(0) !== '/') {
          var baseDir = window.location.pathname.replace(/[^/]+$/, '');
          if (next.indexOf(baseDir) === 0) {
            next = next.slice(baseDir.length);
          } else if (next.charAt(0) === '/') {
            // keep absolute path form
          }
        }
        anchor.setAttribute('href', next);
      } catch (e) {}
    }

    document.querySelectorAll('a[href]').forEach(rewrite);

    document.addEventListener('click', function (e) {
      var anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      rewrite(anchor);
    }, true);
  }

  function bootstrapReviewMode() {
    var params = new URLSearchParams(window.location.search);
    var reviewToken = params.get('review');

    // GitHub Pages (and any other static host without the review backend) has
    // no server to mint tokens via the Admin UI, so fall back to a fixed
    // offline token. This keeps "right-click to add a comment" working on the
    // live site the same way it works locally, without requiring visitors to
    // know/append a `?review=TOKEN` query string.
    if (!reviewToken && isStaticHost()) {
      reviewToken = DEFAULT_STATIC_TOKEN;
    }

    if (reviewToken) {
      ensureReviewQuery(reviewToken);
      preserveReviewOnLinks(reviewToken);
      initReviewMode(reviewToken);
      return;
    }

    // Try to get the default token from the server API
    apiFetch('/api/review-default')
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        var token = data && data.session && data.session.token;
        if (!token) {
          // Fallback: use hardcoded default token if available
          tryHardcodedToken();
          return;
        }
        ensureReviewQuery(token);
        preserveReviewOnLinks(token);
        initReviewMode(token);
      })
      .catch(function () {
        // If API call fails, try hardcoded token as fallback
        tryHardcodedToken();
      });

    function tryHardcodedToken() {
      // This token matches the one in server/review-defaults.json
      var fallbackToken = 'ade20793493210f2321bfbf8cc64278a';
      ensureReviewQuery(fallbackToken);
      preserveReviewOnLinks(fallbackToken);
      initReviewMode(fallbackToken);
    }
  }

  function apiFetch(url, options) {
    options = options || {};
    options.cache = 'no-store';
    var userId = '';
    try { userId = localStorage.getItem('rv-user-id') || ''; } catch (e) {}
    options.headers = Object.assign({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'X-Review-User-Id': userId
    }, options.headers || {});
    return fetch(url, options);
  }

  bootstrapReviewMode();

  function initReviewMode(reviewToken) {
  var SECTIONS = detectSections();
  var PAGE_PATH = getCurrentPagePath();
  var state = {
    token: reviewToken,
    session: null,
    comments: [],
    panelOpen: false,
    tapMode: false,
    draft: null,
    activeCommentId: null,
    editingCommentId: null,
    contextMenu: null,
    connected: false,
    syncError: false,
    eventSource: null,
    submitting: false,
    confirmOpen: false,
    allPinsVisible: true,
    panelFilter: 'all',
    panelSearch: '',
    showAllTabs: false,
    userId: null,
    isOwner: false,
    editLocks: {}
  };

  var isOfflineMode = false;
  var LS_KEY = 'rv-offline-' + reviewToken;
  var LS_BAK_KEY = 'rv-offline-bak-' + reviewToken;
  var LS_DELETED_KEY = 'rv-deleted-' + reviewToken;
  var LS_USER_KEY = 'rv-user-id';
  var flushInFlight = false;
  var restoredFromBackupNotice = false;
  var beforeUnloadBound = false;

  function getOrCreateUserId() {
    try {
      var existing = localStorage.getItem(LS_USER_KEY);
      if (existing) return existing;
      var id = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(LS_USER_KEY, id);
      return id;
    } catch (e) {
      return 'user-ephemeral-' + Math.random().toString(36).slice(2, 10);
    }
  }

  state.userId = getOrCreateUserId();

  function syncStatus() {
    // Green = live/syncing, Yellow = offline, Red = error
    if (state.syncError) return { level: 'error', label: 'Error', className: 'error' };
    if (isOfflineMode) return { level: 'offline', label: 'Offline', className: 'offline' };
    if (state.connected) return { level: 'live', label: 'Synced', className: 'live' };
    return { level: 'syncing', label: 'Syncing', className: 'syncing' };
  }

  function bindBeforeUnloadWarning() {
    if (beforeUnloadBound) return;
    beforeUnloadBound = true;
    window.addEventListener('beforeunload', function (e) {
      if (!isOfflineMode) return;
      if (!state.comments || !state.comments.length) return;
      var message = 'Only saved locally. Comments may be lost if you close this tab.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    });
  }

  function lsLoad() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return tryBackupLoad();
      var parsed = JSON.parse(raw);
      return {
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        savedAt: parsed.savedAt || null,
        source: 'primary'
      };
    } catch (e) {
      console.warn('[review] Primary comment backup corrupted, trying secondary…');
      return tryBackupLoad(true);
    }
  }

  function tryBackupLoad(fromCorrupt) {
    try {
      var raw = localStorage.getItem(LS_BAK_KEY);
      if (!raw) {
        if (fromCorrupt) state._corruptBackup = true;
        return { comments: [], corrupted: !!fromCorrupt };
      }
      var parsed = JSON.parse(raw);
      return {
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        savedAt: parsed.savedAt || null,
        source: 'backup',
        recoveredFromCorrupt: !!fromCorrupt
      };
    } catch (e2) {
      state._corruptBackup = true;
      return { comments: [], corrupted: true };
    }
  }

  function lsLoadDeleted() {
    try {
      var raw = localStorage.getItem(LS_DELETED_KEY);
      var ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids : [];
    } catch (e) { return []; }
  }

  function lsRememberDeleted(commentId) {
    if (!commentId) return;
    try {
      var ids = lsLoadDeleted();
      if (ids.indexOf(commentId) === -1) ids.push(commentId);
      if (ids.length > 500) ids = ids.slice(-500);
      localStorage.setItem(LS_DELETED_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  function stripLocalMeta(comment) {
    if (!comment) return comment;
    var copy = Object.assign({}, comment);
    delete copy._pendingSync;
    return copy;
  }

  function persistLocalBackup() {
    try {
      var payload = JSON.stringify({
        comments: state.comments.map(function (c) {
          var copy = stripLocalMeta(c);
          // Nested replies stay with the comment for wipe-restore durability.
          copy.replies = Array.isArray(c.replies) ? c.replies.slice() : [];
          return copy;
        }),
        savedAt: new Date().toISOString(),
        replyCount: countAllReplies(state.comments)
      });
      // Rotate previous good snapshot into secondary backup first.
      var prev = localStorage.getItem(LS_KEY);
      if (prev) localStorage.setItem(LS_BAK_KEY, prev);
      localStorage.setItem(LS_KEY, payload);
    } catch (e) {}
  }

  function countAllReplies(comments) {
    var total = 0;
    (comments || []).forEach(function (c) {
      total += (c.replies || []).length;
    });
    return total;
  }

  // Alias used by existing offline paths.
  function lsSave() {
    persistLocalBackup();
  }

  function mergeCommentLists(serverList, localList, deletedIds) {
    var deleted = {};
    (deletedIds || []).forEach(function (id) { deleted[id] = true; });

    var byId = {};
    var serverIds = {};

    (localList || []).forEach(function (c) {
      if (!c || !c.id || deleted[c.id]) return;
      byId[c.id] = Object.assign({}, c);
    });

    (serverList || []).forEach(function (c) {
      if (!c || !c.id || deleted[c.id]) return;
      serverIds[c.id] = true;
      var local = byId[c.id];
      if (!local) {
        byId[c.id] = Object.assign({}, c, { _pendingSync: false });
        return;
      }
      var serverTime = c.updatedAt || c.createdAt || '';
      var localTime = local.updatedAt || local.createdAt || '';
      if (serverTime >= localTime) {
        byId[c.id] = Object.assign({}, c, {
          replies: (c.replies && c.replies.length) ? c.replies : (local.replies || []),
          _pendingSync: false
        });
      } else {
        byId[c.id] = Object.assign({}, local, {
          replies: (local.replies && local.replies.length) ? local.replies : (c.replies || []),
          _pendingSync: 'update'
        });
      }
    });

    var serverEmpty = !serverList || serverList.length === 0;
    Object.keys(byId).forEach(function (id) {
      if (serverIds[id]) return;
      var comment = byId[id];
      if (comment._pendingSync === 'create' || comment._pendingSync === 'update') return;
      if (isLocalCommentId(id) || comment._pendingSync) {
        comment._pendingSync = 'create';
      } else if (serverEmpty) {
        // Full server wipe recovery: re-upload durable copies from this browser.
        comment._pendingSync = 'create';
      } else {
        // Likely brief sync lag after create — keep visible, do not duplicate.
        comment._pendingSync = false;
      }
    });

    return Object.keys(byId).map(function (key) { return byId[key]; }).sort(function (a, b) {
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
  }

  function applyRemoteComments(serverComments) {
    var backup = lsLoad().comments || [];
    var memory = state.comments || [];
    var localSeed = backup.length >= memory.length ? backup : memory;
    var deletedIds = lsLoadDeleted();
    var serverList = Array.isArray(serverComments) ? serverComments : [];
    var merged = mergeCommentLists(serverList, localSeed, deletedIds);

    // Never accept a sudden empty server wipe while this browser still has comments.
    if (serverList.length === 0 && localSeed.length > 0 && merged.length > 0) {
      if (!restoredFromBackupNotice) {
        restoredFromBackupNotice = true;
        var replyN = countAllReplies(merged);
        showToast(
          'Restored ' + merged.length + ' comment' + (merged.length === 1 ? '' : 's') +
          ', ' + replyN + ' repl' + (replyN === 1 ? 'y' : 'ies') + ' from local backup.'
        );
        console.log(
          '[review] Restored ' + merged.length + ' comments, ' + replyN + ' replies from backup'
        );
      }
    }

    state.comments = merged;
    persistLocalBackup();
    return flushPendingComments();
  }

  function flushPendingComments() {
    if (isOfflineMode || flushInFlight) return Promise.resolve();
    var pending = state.comments.filter(function (c) { return c && c._pendingSync; });
    if (!pending.length) return Promise.resolve();

    flushInFlight = true;
    var chain = Promise.resolve();

    pending.forEach(function (comment) {
      chain = chain.then(function () {
        var current = getComment(comment.id);
        if (!current || !current._pendingSync) return;

        if (current._pendingSync === 'update') {
          return apiJson('/api/comments/' + encodeURIComponent(current.id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              body: current.body,
              status: current.status
            })
          }).then(function (data) {
            if (data && data.comment) {
              data.comment.replies = data.comment.replies || current.replies || [];
              data.comment._pendingSync = false;
              upsertComment(data.comment);
            } else {
              current._pendingSync = false;
            }
          }).catch(function () {});
        }

        return apiJson('/api/sessions/' + encodeURIComponent(state.token) + '/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorName: current.authorName,
            body: current.body,
            pagePath: current.pagePath || PAGE_PATH,
            sectionId: current.sectionId,
            sectionLabel: current.sectionLabel,
            tabId: current.tabId || 'default',
            scrollY: current.scrollY,
            pinX: current.pinX,
            pinY: current.pinY,
            anchor: current.anchor || null
          })
        }).then(function (data) {
          if (!data || !data.comment) return;
          var wasActive = state.activeCommentId === current.id;
          removeComment(current.id);
          lsRememberDeleted(current.id);
          data.comment.replies = data.comment.replies || current.replies || [];
          data.comment.anchor = data.comment.anchor || current.anchor || null;
          data.comment._pendingSync = false;
          upsertComment(data.comment);
          if (wasActive) state.activeCommentId = data.comment.id;
        }).catch(function () {});
      });
    });

    return chain.finally(function () {
      flushInFlight = false;
      persistLocalBackup();
    });
  }

  function genId() {
    return 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function isLocalCommentId(id) {
    return String(id || '').indexOf('local-') === 0;
  }

  var root = document.createElement('div');
  root.id = 'rv-root';
  document.body.appendChild(root);
  document.body.classList.add('review-mode');

  var pinLayer = document.createElement('div');
  pinLayer.className = 'rv-pin-layer';
  pinLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pinLayer);

  var tooltip = document.createElement('div');
  tooltip.className = 'rv-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  root.appendChild(tooltip);

  var toastEl = document.createElement('div');
  toastEl.className = 'rv-toast';
  toastEl.setAttribute('role', 'status');
  root.appendChild(toastEl);

  var toastTimer = null;
  var tapModeBound = false;
  var pollTimer = null;
  var sseRetryTimer = null;
  var lastSyncFingerprint = '';
  var draftPopoverPos = null;
  var threadPopoverPos = null;

  function apiJson(url, options) {
    return apiFetch(url, options).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
      });
    });
  }

  function isMobileView() {
    return window.innerWidth <= 640;
  }

  function showToast(message, isError) {
    toastEl.textContent = message;
    toastEl.classList.toggle('error', !!isError);
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3200);
  }

  function confirmAction(opts, onConfirm) {
    if (typeof opts === 'string') {
      opts = { message: opts };
    }
    opts = opts || {};

    var existing = document.getElementById('rv-confirm');
    if (existing) existing.remove();

    state.confirmOpen = true;

    var overlay = document.createElement('div');
    overlay.id = 'rv-confirm';
    overlay.className = 'rv-confirm rv-interactive';
    overlay.innerHTML =
      '<div class="rv-confirm-box" role="alertdialog" aria-labelledby="rv-confirm-title">' +
        '<h3 id="rv-confirm-title" class="rv-confirm-title">' +
          escapeHtml(opts.title || 'Delete comment?') +
        '</h3>' +
        '<p>' + escapeHtml(opts.message || 'This cannot be undone.') + '</p>' +
        '<div class="rv-confirm-actions">' +
          '<button type="button" class="rv-btn rv-btn-ghost-dark rv-confirm-cancel">Cancel</button>' +
          '<button type="button" class="rv-btn rv-btn-danger rv-confirm-ok">' +
            escapeHtml(opts.confirmLabel || 'Delete') +
          '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    var cancelBtn = overlay.querySelector('.rv-confirm-cancel');
    var okBtn = overlay.querySelector('.rv-confirm-ok');
    var box = overlay.querySelector('.rv-confirm-box');

    function closeConfirm() {
      state.confirmOpen = false;
      overlay.remove();
    }

    cancelBtn.addEventListener('click', closeConfirm);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeConfirm();
    });
    box.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    okBtn.addEventListener('click', function () {
      okBtn.disabled = true;
      cancelBtn.disabled = true;
      okBtn.textContent = opts.loadingLabel || 'Deleting…';
      onConfirm(closeConfirm, function restore() {
        okBtn.disabled = false;
        cancelBtn.disabled = false;
        okBtn.textContent = opts.confirmLabel || 'Delete';
      });
    });

    cancelBtn.focus();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatTime(iso) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(iso));
    } catch (e) {
      return iso;
    }
  }

  function formatRelativeTime(iso) {
    try {
      var date = new Date(iso);
      var now = new Date();
      var diffMs = now - date;
      var diffSecs = Math.floor(diffMs / 1000);
      var diffMins = Math.floor(diffSecs / 60);
      var diffHours = Math.floor(diffMins / 60);
      var diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return diffMins + 'm ago';
      if (diffHours < 24) return diffHours + 'h ago';
      if (diffDays < 7) return diffDays + 'd ago';

      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return iso;
    }
  }

  function getStoredName() {
    try {
      return localStorage.getItem('rv-author-name') || '';
    } catch (e) {
      return '';
    }
  }

  function setStoredName(name) {
    try {
      localStorage.setItem('rv-author-name', name);
    } catch (e) {}
  }

  function docHeight() {
    return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  }

  function nearestSection(clientY) {
    var best = SECTIONS[0] || { id: null, label: 'General' };
    var bestDist = Infinity;
    SECTIONS.forEach(function (section) {
      var el = document.getElementById(section.id);
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var dist = Math.abs(clientY - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = section;
      }
    });
    return best;
  }

  function sectionLabel(sectionId) {
    var match = SECTIONS.find(function (s) { return s.id === sectionId; });
    return match ? match.label : sectionId || 'General';
  }

  function isReviewUiTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(REVIEW_UI_SELECTOR);
  }

  function cssEscape(value) {
    if (window.CSS && typeof CSS.escape === 'function') return CSS.escape(value);
    return String(value).replace(/([^a-zA-Z0-9_-])/g, '\\$1');
  }

  function isIgnorableAnchorNode(el) {
    if (!el || el.nodeType !== 1) return true;
    if (isReviewUiTarget(el)) return true;
    var tag = el.tagName;
    return tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' ||
      tag === 'SVG' || tag === 'PATH' || tag === 'BR' || tag === 'HR';
  }

  function prefersAsAnchor(el) {
    if (!el || isIgnorableAnchorNode(el)) return false;
    if (el.getAttribute && el.getAttribute('data-rv-anchor')) return true;
    if (el.id) return true;
    if (el.matches && el.matches(
      'h1,h2,h3,h4,h5,h6,img,button,a,label,li,figcaption,section,article,' +
      '[data-journey-panel],[data-pillar-panel],[data-tab],[role="heading"],[role="button"]'
    )) return true;
    return false;
  }

  function resolveAnchorTarget(clientX, clientY) {
    var stack = [];
    if (document.elementsFromPoint) {
      stack = document.elementsFromPoint(clientX, clientY) || [];
    } else {
      var hit = document.elementFromPoint(clientX, clientY);
      if (hit) stack = [hit];
    }

    var start = null;
    for (var i = 0; i < stack.length; i++) {
      if (!isIgnorableAnchorNode(stack[i])) {
        start = stack[i];
        break;
      }
    }
    if (!start) return null;

    var el = start;
    var fallback = start;
    while (el && el !== document.body && el !== document.documentElement) {
      if (!isIgnorableAnchorNode(el)) {
        fallback = el;
        if (prefersAsAnchor(el)) return el;
      }
      el = el.parentElement;
    }
    return fallback;
  }

  function buildStableSelector(el) {
    if (!el || el.nodeType !== 1) return null;

    if (el.id) {
      var idSel = '#' + cssEscape(el.id);
      try {
        if (document.querySelectorAll(idSel).length === 1) return idSel;
      } catch (e) {}
    }

    var uniqueAttrs = [
      'data-journey-panel',
      'data-pillar-panel',
      'data-tab',
      'data-section',
      'name',
      'aria-label'
    ];
    for (var a = 0; a < uniqueAttrs.length; a++) {
      var attr = uniqueAttrs[a];
      var val = el.getAttribute(attr);
      if (!val) continue;
      var attrSel = el.tagName.toLowerCase() + '[' + attr + '="' +
        String(val).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]';
      try {
        if (document.querySelectorAll(attrSel).length === 1) return attrSel;
      } catch (e) {}
    }

    var parts = [];
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) {
        parts.unshift('#' + cssEscape(cur.id));
        break;
      }
      var tag = cur.tagName.toLowerCase();
      var parent = cur.parentElement;
      if (!parent) {
        parts.unshift(tag);
        break;
      }
      var sameTag = Array.prototype.filter.call(parent.children, function (child) {
        return child.tagName === cur.tagName;
      });
      if (sameTag.length === 1) {
        parts.unshift(tag);
      } else {
        parts.unshift(tag + ':nth-of-type(' + (sameTag.indexOf(cur) + 1) + ')');
      }
      cur = parent;
      if (parts.length > 8) break;
    }
    var selector = parts.join(' > ');
    try {
      if (selector && document.querySelector(selector)) return selector;
    } catch (e) {}
    return selector || null;
  }

  function elementTextHint(el) {
    if (!el) return '';
    var text = '';
    if (el.alt) text = el.alt;
    else if (el.getAttribute && el.getAttribute('aria-label')) text = el.getAttribute('aria-label');
    else text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text.slice(0, 120);
  }

  function createAnchorFromPoint(clientX, clientY, sectionId) {
    var el = resolveAnchorTarget(clientX, clientY);
    if (!el) return null;

    var rect = el.getBoundingClientRect();
    var width = Math.max(rect.width, 1);
    var height = Math.max(rect.height, 1);
    var offsetX = (clientX - rect.left) / width;
    var offsetY = (clientY - rect.top) / height;
    offsetX = Math.min(1, Math.max(0, offsetX));
    offsetY = Math.min(1, Math.max(0, offsetY));

    var dataRvAnchor = ensureDataRvAnchor(el);

    return {
      dataRvAnchor: dataRvAnchor,
      selector: buildStableSelector(el),
      elementId: el.id || null,
      tagName: el.tagName,
      textHint: elementTextHint(el),
      sectionId: sectionId || null,
      offsetX: offsetX,
      offsetY: offsetY
    };
  }

  function findByTextHint(anchor, sectionId) {
    if (!anchor || !anchor.textHint) return null;
    var hint = anchor.textHint.replace(/\s+/g, ' ').trim().toLowerCase();
    if (!hint || hint.length < 3) return null;

    var roots = [];
    var sid = sectionId || anchor.sectionId;
    if (sid) {
      var section = document.getElementById(sid);
      if (section) roots.push(section);
    }
    roots.push(document.body);

    var selector = 'h1,h2,h3,h4,h5,h6,p,li,button,a,label,figcaption,img,span,div';
    for (var r = 0; r < roots.length; r++) {
      var nodes = roots[r].querySelectorAll(selector);
      var best = null;
      var bestScore = 0;
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (isIgnorableAnchorNode(node)) continue;
        var text = elementTextHint(node).toLowerCase();
        if (!text) continue;
        if (text === hint) return node;
        if (text.indexOf(hint) !== -1 || hint.indexOf(text.slice(0, 40)) !== -1) {
          var score = Math.min(text.length, hint.length);
          if (score > bestScore) {
            bestScore = score;
            best = node;
          }
        }
      }
      if (best) return best;
    }
    return null;
  }

  function resolveAnchorElement(anchor, sectionId) {
    if (!anchor) return null;

    // 1) data-rv-anchor (most stable stamped id)
    var rvId = anchor.dataRvAnchor || anchor.rvAnchor;
    if (rvId) {
      try {
        var byRv = document.querySelector('[data-rv-anchor="' + cssEscape(rvId).replace(/\\/g, '') + '"]');
        // cssEscape may over-escape attribute values; try raw too
        if (!byRv) byRv = document.querySelector('[data-rv-anchor="' + String(rvId).replace(/"/g, '\\"') + '"]');
        if (byRv && !isIgnorableAnchorNode(byRv)) return byRv;
      } catch (e) {
        try {
          var nodes = document.querySelectorAll('[data-rv-anchor]');
          for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute('data-rv-anchor') === rvId) return nodes[i];
          }
        } catch (e2) {}
      }
    }

    // 2) element id
    if (anchor.elementId) {
      var byId = document.getElementById(anchor.elementId);
      if (byId && !isIgnorableAnchorNode(byId)) return byId;
    }

    // 3) CSS selector (may include :nth-of-type)
    if (anchor.selector) {
      try {
        var bySel = document.querySelector(anchor.selector);
        if (bySel && !isIgnorableAnchorNode(bySel)) return bySel;
      } catch (e) {}
    }

    // 4) text hint fallback
    return findByTextHint(anchor, sectionId);
  }

  function ensureDataRvAnchor(el) {
    if (!el || el.nodeType !== 1) return null;
    var existing = el.getAttribute('data-rv-anchor');
    if (existing) return existing;
    var generated = 'rv_dyn_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    try { el.setAttribute('data-rv-anchor', generated); } catch (e) {}
    return generated;
  }

  function isAnchorBroken(comment) {
    if (!comment) return false;
    if (comment.legacy && !comment.anchor) return false;
    if (!comment.anchor) return false;
    return !resolveAnchorElement(comment.anchor, comment.sectionId);
  }

  function verifyAnchors() {
    var broken = [];
    pageComments().forEach(function (c) {
      if (c.anchor && !resolveAnchorElement(c.anchor, c.sectionId)) {
        broken.push(c);
        c.anchorBroken = true;
      } else if (c.anchor) {
        c.anchorBroken = false;
      }
    });
    if (broken.length) {
      console.warn(
        '[review] Broken anchors:',
        broken.length,
        broken.map(function (c) {
          return { id: c.id, selector: c.anchor && c.anchor.selector, text: (c.body || '').slice(0, 40) };
        })
      );
    } else {
      console.log('[review] verifyAnchors: all anchored comments OK');
    }
    return broken;
  }

  function migrateAllComments() {
    var total = 0;
    var success = 0;
    var failed = 0;

    state.comments.forEach(function (comment) {
      var hasLegacyPins = comment.pinX != null && comment.pinY != null;
      var needsMigration = hasLegacyPins && (!comment.anchor || !comment.anchor.selector && !comment.anchor.dataRvAnchor);
      if (!needsMigration) {
        if (comment.anchor && resolveAnchorElement(comment.anchor, comment.sectionId)) return;
        if (!hasLegacyPins) return;
      }
      if (comment.anchor && resolveAnchorElement(comment.anchor, comment.sectionId)) return;

      total += 1;
      var docW = document.documentElement.clientWidth || window.innerWidth;
      var height = docHeight();
      var clientX = (comment.pinX || 0.5) * docW;
      var clientY = (comment.pinY || 0) * height - window.scrollY;
      // Clamp into viewport for elementsFromPoint
      clientX = Math.min(Math.max(clientX, 8), docW - 8);
      clientY = Math.min(Math.max(clientY, 8), window.innerHeight - 8);

      var anchor = createAnchorFromPoint(clientX, clientY, comment.sectionId);
      if (anchor && (anchor.selector || anchor.dataRvAnchor || anchor.elementId)) {
        comment.anchor = anchor;
        comment.legacy = false;
        comment.anchorBroken = false;
        success += 1;

        if (!isOfflineMode) {
          apiJson('/api/comments/' + encodeURIComponent(comment.id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              anchor: anchor,
              legacy: false,
              lastEditedBy: getStoredName() || 'migration'
            })
          }).catch(function () {});
        }
      } else {
        comment.legacy = true;
        comment.anchorBroken = true;
        failed += 1;
      }
    });

    persistLocalBackup();
    console.log(
      'Migrated ' + total + ', success ' + success + ', failed ' + failed
    );
    return { total: total, success: success, failed: failed };
  }

  function getCommentPinPosition(comment) {
    var anchor = comment && comment.anchor;
    var el = resolveAnchorElement(anchor, comment && comment.sectionId);
    if (el && anchor) {
      var rect = el.getBoundingClientRect();
      var ox = typeof anchor.offsetX === 'number' ? anchor.offsetX : 0.5;
      var oy = typeof anchor.offsetY === 'number' ? anchor.offsetY : 0.15;
      var clientX = rect.left + rect.width * ox;
      var clientY = rect.top + rect.height * oy;
      return {
        leftPx: window.scrollX + clientX,
        topPx: window.scrollY + clientY,
        clientX: clientX,
        clientY: clientY,
        anchored: true,
        element: el
      };
    }

    // Legacy fallback: absolute page percentages (pre-anchor comments).
    if (comment && comment.pinX != null && comment.pinY != null) {
      var height = docHeight();
      var leftPx = comment.pinX * document.documentElement.clientWidth;
      var topPx = comment.pinY * height;
      return {
        leftPx: leftPx,
        topPx: topPx,
        clientX: leftPx - window.scrollX,
        clientY: topPx - window.scrollY,
        anchored: false,
        element: null
      };
    }

    return null;
  }

  function getJourneyTabId() {
    var journeyRoot = document.getElementById('product-journey');
    if (!journeyRoot) return null;
    var activePanel = journeyRoot.querySelector('.journey-panel.is-active');
    if (!activePanel) return null;
    // Prefer actual ID if it exists, otherwise use data-journey-panel attribute, then fall back to index
    if (activePanel.id) return activePanel.id;
    var journeyAttr = activePanel.getAttribute('data-journey-panel');
    if (journeyAttr) return 'journey-panel-' + journeyAttr;
    return 'journey-' + Array.prototype.indexOf.call(
      journeyRoot.querySelectorAll('.journey-panel'),
      activePanel
    );
  }

  function getPillarsTabId() {
    var pillarsRoot = document.getElementById('three-pillars');
    if (!pillarsRoot) return null;
    var activePanel = pillarsRoot.querySelector('.pillars-panel-content.is-active');
    if (!activePanel) return null;
    // Prefer actual ID if it exists, otherwise use data-pillar-panel attribute, then fall back to index
    if (activePanel.id) return activePanel.id;
    var pillarAttr = activePanel.getAttribute('data-pillar-panel');
    if (pillarAttr) return 'pillar-' + pillarAttr;
    return 'pillars-' + Array.prototype.indexOf.call(
      pillarsRoot.querySelectorAll('.pillars-panel-content'),
      activePanel
    );
  }

  // Global "currently active sub-tab" - used only to match against comments that were
  // themselves created inside a tabbed widget (journey/pillars). Does NOT reflect scroll position.
  function getCurrentTabId() {
    return getJourneyTabId() || getPillarsTabId() || 'default';
  }

  // Returns a widget-specific tab id only if the given viewport point is actually
  // located inside the journey or pillars widget; otherwise 'default'. This prevents
  // comments pinned elsewhere on the page (hero, footer, pricing, etc.) from being
  // mistakenly tagged with whichever sub-tab happens to be active in a widget below/above them.
  function getTabIdForPoint(clientX, clientY) {
    var el = null;
    try {
      el = document.elementFromPoint(clientX, clientY);
    } catch (e) {
      el = null;
    }
    if (el) {
      var journeyRoot = document.getElementById('product-journey');
      if (journeyRoot && journeyRoot.contains(el)) {
        return getJourneyTabId() || 'default';
      }
      var pillarsRoot = document.getElementById('three-pillars');
      if (pillarsRoot && pillarsRoot.contains(el)) {
        return getPillarsTabId() || 'default';
      }
    }
    return 'default';
  }

  function getCommentColor(commentIndex) {
    return COMMENT_COLORS[commentIndex % COMMENT_COLORS.length];
  }

  function getCommentColorByIndex(comments, commentId) {
    var index = comments.findIndex(function (c) { return c.id === commentId; });
    return index >= 0 ? getCommentColor(index) : COMMENT_COLORS[0];
  }

  function commentPagePath(comment) {
    if (!comment) return '/';
    if (comment.pagePath) return normalizeClientPagePath(comment.pagePath);
    // Legacy comments (created before pagePath) belong to the homepage.
    return '/';
  }

  function isCommentOnCurrentPage(comment) {
    return commentPagePath(comment) === PAGE_PATH;
  }

  function isCommentOnActiveTab(comment) {
    // If comment has no tabId, treat it as 'default' (backward compatibility for legacy comments).
    // 'default' comments belong to the page at large (not a specific journey/pillars sub-tab),
    // so they should always be visible regardless of which sub-tab happens to be active.
    var commentTabId = comment.tabId || 'default';
    if (commentTabId === 'default') return true;
    return commentTabId === getCurrentTabId();
  }

  function pageComments() {
    return state.comments.filter(isCommentOnCurrentPage);
  }

  function visibleComments() {
    var comments = state.showAllTabs
      ? pageComments()
      : pageComments().filter(isCommentOnActiveTab);

    return comments.sort(function (a, b) {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  function tabScopedCount(tabId) {
    return pageComments().filter(function (c) {
      return (c.tabId || 'default') === tabId;
    }).length;
  }

  function otherTabCommentCount() {
    var active = getCurrentTabId();
    return pageComments().filter(function (c) {
      var tid = c.tabId || 'default';
      return tid !== 'default' && tid !== active;
    }).length;
  }

  function getComment(commentId) {
    return state.comments.find(function (c) { return c.id === commentId; }) || null;
  }

  function openCount() {
    return visibleComments().filter(function (c) { return c.status === 'open'; }).length;
  }

  function renderBar() {
    var title = state.session ? state.session.title : 'Review mode';
    var sync = syncStatus();
    var subLabel = isMobileView()
      ? 'Tap + Add, then tap the page · Pin = view comment'
      : (isOfflineMode
          ? 'Right-click to add · Only saved locally'
          : 'Right-click to add · Click a pin to view or edit');
    var ownerBadge = state.isOwner
      ? '<span class="rv-owner-badge" title="You are the session owner">Owner</span>'
      : '';

    root.innerHTML =
      '<div class="rv-bar rv-interactive">' +
        '<div class="rv-bar-brand">' +
          '<span class="rv-bar-dot rv-bar-dot--' + sync.className + '"></span>' +
          '<div>' +
            '<div class="rv-bar-title">' + escapeHtml(title) + ' ' + ownerBadge + '</div>' +
            '<div class="rv-bar-sub">' + subLabel + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rv-bar-actions">' +
          '<span class="rv-status rv-status--desktop rv-sync-indicator rv-sync-' + sync.className + '" title="Sync status">' +
            '<span class="rv-status-dot ' + sync.className + '"></span>' + sync.label +
          '</span>' +
          (pageComments().length
            ? '<button type="button" class="rv-btn rv-btn-ghost" id="rv-export-btn" title="Export comments as JSON">' +
                '<span class="rv-btn-long">Export</span><span class="rv-btn-short">Export</span>' +
              '</button>'
            : '') +
          (visibleComments().length > 0
            ? '<button type="button" class="rv-btn rv-btn-ghost" id="rv-visibility-btn" title="' + (state.allPinsVisible ? 'Hide' : 'Show') + ' comments">' +
                '<span class="rv-btn-long">' + (state.allPinsVisible ? 'Hide' : 'Show') + ' pins</span>' +
                '<span class="rv-btn-short">' + (state.allPinsVisible ? '👁️' : '🔒') + '</span>' +
              '</button>'
            : '') +
          '<button type="button" class="rv-btn rv-btn-primary' + (state.tapMode ? ' active' : '') + '" id="rv-add-btn">' +
            '<span class="rv-btn-long">Tap to comment</span><span class="rv-btn-short">+ Add</span>' +
          '</button>' +
          '<button type="button" class="rv-btn rv-btn-ghost" id="rv-panel-btn">' +
            '<span class="rv-btn-long">' + (state.panelOpen ? 'Hide' : 'Comments') + ' (' + openCount() + ')</span>' +
            '<span class="rv-btn-short">' + openCount() + '</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      toastEl.outerHTML;

    toastEl = root.querySelector('.rv-toast');
    root.appendChild(tooltip);
    root.querySelector('#rv-add-btn').addEventListener('click', toggleTapMode);
    root.querySelector('#rv-panel-btn').addEventListener('click', togglePanel);
    var visibilityBtn = root.querySelector('#rv-visibility-btn');
    if (visibilityBtn) visibilityBtn.addEventListener('click', togglePinsVisibility);
    var exportBtn = root.querySelector('#rv-export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportCommentsJson);
    document.body.classList.toggle('rv-add-mode', state.tapMode);
    bindBeforeUnloadWarning();
  }

  function filteredPanelComments() {
    var comments = visibleComments();
    var numbered = comments.map(function (comment, i) {
      return { comment: comment, num: i + 1, color: getCommentColor(i) };
    });

    if (state.panelFilter === 'open') {
      numbered = numbered.filter(function (n) { return n.comment.status !== 'resolved'; });
    } else if (state.panelFilter === 'resolved') {
      numbered = numbered.filter(function (n) { return n.comment.status === 'resolved'; });
    }

    var query = (state.panelSearch || '').trim().toLowerCase();
    if (query) {
      numbered = numbered.filter(function (n) {
        return (n.comment.body || '').toLowerCase().indexOf(query) !== -1 ||
          (n.comment.authorName || '').toLowerCase().indexOf(query) !== -1;
      });
    }

    return numbered;
  }

  function renderCommentCards() {
    var all = visibleComments();
    var items = filteredPanelComments();

    if (!all.length) {
      var hint = isMobileView() ?
        'Tap <strong>+ Add</strong>, then tap anywhere on the page.' :
        '<strong>Right-click</strong> anywhere on the page to leave feedback.';
      var hiddenCount = pageComments().length - all.length;
      var message = '<div class="rv-empty">No comments yet on this tab. ' + hint + '</div>';
      if (hiddenCount > 0) {
        message = '<div class="rv-empty"><p>No comments on this tab.</p><p style="font-size:12px;color:#888;margin-top:8px">' +
          hiddenCount + ' comment' + (hiddenCount === 1 ? '' : 's') + ' on other tabs</p></div>';
      }
      return message;
    }

    if (!items.length) {
      return '<div class="rv-empty">No comments match your filter.</div>';
    }

    return items.slice().reverse().map(function (entry) {
      var comment = entry.comment;
      var commentNum = entry.num;
      var color = entry.color;
      var resolved = comment.status === 'resolved';
      var active = comment.id === state.activeCommentId ? ' active' : '';
      var replyCount = (comment.replies || []).length;
      var initial = (comment.authorName || '?').trim().charAt(0).toUpperCase();
      var isOwner = comment.authorName === getStoredName();
      var isPinned = comment.pinned ? ' pinned' : '';
      return (
        '<article class="rv-card' + (resolved ? ' resolved' : '') + (isOwner ? ' owner' : '') + isPinned + active + '" ' +
          'data-id="' + comment.id + '" ' +
          'tabindex="0" ' +
          'role="button" ' +
          'aria-label="Comment #' + commentNum + ' by ' + escapeHtml(comment.authorName) + 
          (resolved ? ' - Resolved' : ' - Open') +
          (replyCount ? ' with ' + replyCount + ' repl' + (replyCount === 1 ? 'y' : 'ies') : '') + '">' +
          '<span class="rv-card-dot' + (isOwner ? ' rv-card-dot--owner' : '') + '" style="background-color:' + color.hex + '">' + initial + '</span>' +
          '<div class="rv-card-main">' +
          '<div class="rv-card-top">' +
            '<span class="rv-card-num" style="color:' + color.hex + '">#' + commentNum + '</span>' +
            (comment.pinned ? '<span class="rv-priority-badge">📌 Pinned</span>' : '') +
            (comment.tabId && comment.tabId !== 'default'
              ? '<span class="rv-tab-scope-icon" title="Tab-scoped: ' + escapeHtml(humanizeTabId(comment.tabId)) + '">🗂</span>'
              : '') +
            (isAnchorBroken(comment) || comment.anchorBroken
              ? '<span class="rv-anchor-broken-badge" title="Target element not found.">Anchor broken</span>'
              : '') +
            (comment.legacy ? '<span class="rv-legacy-badge" title="Legacy position (not element-anchored)">Legacy</span>' : '') +
            '<span class="rv-card-author">' + escapeHtml(comment.authorName) + 
            (isOwner ? '<span class="rv-card-owner-badge" aria-label="Your comment">You</span>' : '') + '</span>' +
              (comment.sectionLabel || comment.sectionId ?
                '<span class="rv-card-section">' + escapeHtml(comment.sectionLabel || sectionLabel(comment.sectionId)) + '</span>' : '') +
              '<span class="rv-card-time" title="' + escapeHtml(formatTime(comment.createdAt)) + '">' + escapeHtml(formatRelativeTime(comment.createdAt)) + '</span>' +
            '</div>' +
            '<div class="rv-card-body">' + escapeHtml(comment.body) + '</div>' +
            (replyCount || resolved ?
              '<div class="rv-card-foot">' +
                (replyCount ? '<span class="rv-card-replies">' + replyCount + ' repl' + (replyCount === 1 ? 'y' : 'ies') + '</span>' : '') +
                (resolved ? '<span class="rv-badge rv-badge-resolved">Resolved</span>' : '') +
              '</div>' : '') +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderPanel() {
    var existingBackdrop = document.getElementById('rv-panel-backdrop');
    if (existingBackdrop) existingBackdrop.remove();
    var existing = document.getElementById('rv-panel');
    if (existing) existing.remove();

    if (state.panelOpen) {
      var backdrop = document.createElement('div');
      backdrop.id = 'rv-panel-backdrop';
      backdrop.className = 'rv-panel-backdrop rv-interactive';
      backdrop.addEventListener('click', function () {
        state.panelOpen = false;
        renderAll();
      });
      document.body.appendChild(backdrop);
    }

    var panel = document.createElement('aside');
    panel.id = 'rv-panel';
    panel.className = 'rv-panel rv-interactive' + (state.panelOpen ? ' open' : '');
    panel.setAttribute('aria-label', 'Review comments panel');
    panel.setAttribute('role', 'complementary');

    var all = visibleComments();
    var openN = all.filter(function (c) { return c.status !== 'resolved'; }).length;
    var resolvedN = all.length - openN;
    var filter = state.panelFilter;
    var activeTab = getCurrentTabId();
    var activeTabLabel = humanizeTabId(activeTab);
    var pageTotal = pageComments().length;
    var otherTabs = otherTabCommentCount();

    function tab(key, label, count) {
      return '<button type="button" class="rv-filter-tab' + (filter === key ? ' active' : '') + '" ' +
        'data-filter="' + key + '" ' +
        'role="tab" ' +
        'aria-selected="' + (filter === key ? 'true' : 'false') + '" ' +
        'aria-controls="rv-list">' +
        label + '<span class="rv-filter-count" aria-hidden="true">' + count + '</span>' +
      '</button>';
    }

    var deleteLabel = state.isOwner || isOfflineMode
      ? 'Delete all'
      : 'Delete my comments only';

    panel.innerHTML =
      '<div class="rv-panel-head">' +
        '<div class="rv-panel-head-row">' +
          '<h2>Comments <span class="rv-panel-total">' + all.length + '</span>' +
            (state.isOwner ? ' <span class="rv-owner-badge">Owner</span>' : '') +
          '</h2>' +
          '<button type="button" class="rv-panel-close" aria-label="Close comments panel">&times;</button>' +
        '</div>' +
        '<div class="rv-tab-filter-indicator">' +
          (state.showAllTabs
            ? '<span>Showing: <strong>All tabs</strong> (' + pageTotal + ')</span>'
            : '<span>Filtered to: <strong>' + escapeHtml(activeTabLabel) + '</strong>' +
                (otherTabs ? ' · ' + otherTabs + ' on other tabs' : '') + '</span>') +
          '<button type="button" class="rv-btn rv-btn-ghost-dark rv-toggle-all-tabs" id="rv-toggle-all-tabs">' +
            (state.showAllTabs ? 'Filter to this tab' : 'Show all tabs') +
          '</button>' +
        '</div>' +
        '<div class="rv-search-wrap">' +
          '<label for="rv-panel-search" class="rv-sr-only">Search comments</label>' +
          '<input type="search" id="rv-panel-search" class="rv-search-input" placeholder="Search comments…" value="' + escapeHtml(state.panelSearch || '') + '" aria-label="Search comments by text or author">' +
        '</div>' +
        '<div class="rv-filter-tabs" role="tablist" aria-label="Filter comments by status">' +
          tab('all', 'All', all.length) +
          tab('open', 'Open', openN) +
          tab('resolved', 'Resolved', resolvedN) +
        '</div>' +
        (all.length > 0 ?
          '<div class="rv-panel-actions">' +
            '<button type="button" class="rv-panel-resolve-all" title="Mark all open comments as resolved" onclick="markAllResolved()">Mark all resolved</button>' +
            '<button type="button" class="rv-panel-delete-all" title="' + deleteLabel + '">' + deleteLabel + '</button>' +
          '</div>' : '') +
      '</div>' +
      '<div class="rv-list" id="rv-list" role="region" aria-label="Comments list" aria-live="polite">' + renderCommentCards() + '</div>';

    document.body.appendChild(panel);

    panel.querySelector('.rv-panel-close').addEventListener('click', function () {
      state.panelOpen = false;
      renderAll();
    });

    var toggleTabsBtn = panel.querySelector('#rv-toggle-all-tabs');
    if (toggleTabsBtn) {
      toggleTabsBtn.addEventListener('click', function () {
        state.showAllTabs = !state.showAllTabs;
        renderAll();
      });
    }

    var deleteAllBtn = panel.querySelector('.rv-panel-delete-all');
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', function () {
        if (state.isOwner || isOfflineMode) deleteAllComments();
        else deleteMyCommentsOnly();
      });
    }

    panel.querySelectorAll('.rv-filter-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.panelFilter = btn.dataset.filter;
        panel.querySelectorAll('.rv-filter-tab').forEach(function (t) {
          t.setAttribute('aria-selected', 'false');
        });
        btn.setAttribute('aria-selected', 'true');
        renderPanel();
      });
    });

    var searchInput = panel.querySelector('#rv-panel-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.panelSearch = searchInput.value;
        var list = panel.querySelector('#rv-list');
        if (list) list.innerHTML = renderCommentCards();
        bindCardClicks(panel);
      });
    }

    bindCardClicks(panel);
  }

  function bindCardClicks(panel) {
    panel.querySelectorAll('.rv-card').forEach(function (card) {
      card.addEventListener('click', function () {
        focusComment(card.dataset.id);
      });
    });
  }

  function closeThreadBackdrop() {
    var existing = document.getElementById('rv-thread-backdrop');
    if (existing) existing.remove();
  }

  function openThreadBackdrop() {
    // Intentionally unused: Figma-style commenting has no page-dimming overlay.
    closeThreadBackdrop();
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  function showTooltip(comment, clientX, clientY) {
    var preview = comment.body.length > 100 ? comment.body.slice(0, 100) + '…' : comment.body;
    var replyCount = (comment.replies || []).length;
    tooltip.innerHTML =
      '<strong>' + escapeHtml(comment.authorName) + '</strong> · ' +
      (comment.status === 'resolved' ? 'Resolved' : 'Open') +
      '<br>' + escapeHtml(preview) +
      (replyCount ? '<span class="rv-tooltip-meta">' + replyCount + ' repl' + (replyCount === 1 ? 'y' : 'ies') + '</span>' : '');

    tooltip.style.left = '0';
    tooltip.style.top = '0';
    tooltip.classList.add('visible');

    var rect = tooltip.getBoundingClientRect();
    var left = clientX + 14;
    var top = clientY - rect.height - 10;
    if (left + rect.width > window.innerWidth - 12) left = clientX - rect.width - 14;
    if (left < 12) left = 12;
    if (top < 12) top = clientY + 14;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function renderPins() {
    pinLayer.innerHTML = '';
    if (!state.allPinsVisible) return;

    var visibleCommentsList = visibleComments();
    var pinNumber = 0;

    visibleCommentsList.forEach(function (comment) {
      var pos = getCommentPinPosition(comment);
      if (!pos) return;
      pinNumber += 1;

      var color = getCommentColor(visibleCommentsList.indexOf(comment));
      var pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'rv-pin' +
        (comment.status === 'resolved' ? ' resolved' : '') +
        (comment.id === state.activeCommentId ? ' active' : '') +
        (pos.anchored ? ' anchored' : ' legacy');
      pin.style.top = pos.topPx + 'px';
      pin.style.left = pos.leftPx + 'px';
      pin.style.backgroundColor = color.hex;
      pin.style.borderColor = '#fff';
      pin.textContent = String(pinNumber);
      pin.setAttribute(
        'aria-label',
        'Comment #' + pinNumber + ' by ' + comment.authorName +
          (pos.anchored ? ' (anchored to element)' : '')
      );
      pin.setAttribute('data-comment-id', comment.id);
      if (pos.anchored) pin.setAttribute('data-anchored', 'true');

      pin.addEventListener('mouseenter', function (e) {
        showTooltip(comment, e.clientX, e.clientY);
      });
      pin.addEventListener('mousemove', function (e) {
        showTooltip(comment, e.clientX, e.clientY);
      });
      pin.addEventListener('mouseleave', hideTooltip);
      pin.addEventListener('click', function (e) {
        e.stopPropagation();
        openThreadPopover(comment, e.clientX, e.clientY);
      });

      pinLayer.appendChild(pin);
    });
  }

  function renderPendingPin() {
    var existing = document.getElementById('rv-pending-pin');
    if (existing) existing.remove();
    if (!state.draft) return;

    var pos = null;
    if (state.draft.anchor) {
      pos = getCommentPinPosition({
        anchor: state.draft.anchor,
        sectionId: state.draft.sectionId,
        pinX: state.draft.pinX,
        pinY: state.draft.pinY
      });
    }
    if (!pos) {
      pos = {
        topPx: state.draft.pinY * docHeight(),
        leftPx: state.draft.pinX * document.documentElement.clientWidth
      };
    }

    var marker = document.createElement('div');
    marker.id = 'rv-pending-pin';
    marker.className = 'rv-pending-pin';
    marker.style.top = pos.topPx + 'px';
    marker.style.left = pos.leftPx + 'px';
    marker.setAttribute('aria-hidden', 'true');
    document.body.appendChild(marker);
  }

  function renderAddHint() {
    var existing = document.getElementById('rv-add-hint');
    if (existing) existing.remove();
    if (!state.tapMode || state.draft) return;

    var hint = document.createElement('div');
    hint.id = 'rv-add-hint';
    hint.className = 'rv-add-hint rv-interactive';
    hint.textContent = 'Tap anywhere on the page to place a comment';
    document.body.appendChild(hint);
  }

  function clampPopoverPosition(clientX, clientY, heightEstimate) {
    var width = Math.min(360, window.innerWidth - 24);
    var height = heightEstimate || 300;

    if (isMobileView()) {
      return {
        left: Math.max(12, (window.innerWidth - width) / 2),
        top: Math.max(64, window.innerHeight - height - 16)
      };
    }

    var left = clientX + 16;
    var top = clientY + 16;

    if (left + width > window.innerWidth - 12) left = clientX - width - 16;
    if (left < 12) left = 12;
    if (top + height > window.innerHeight - 12) top = clientY - height - 16;
    if (top < 64) top = 64;

    return { left: left, top: top };
  }

  function clampToViewport(left, top, width, height) {
    var margin = 8;
    var maxLeft = Math.max(margin, window.innerWidth - width - margin);
    var maxTop = Math.max(margin, window.innerHeight - height - margin);
    return {
      left: Math.min(Math.max(left, margin), maxLeft),
      top: Math.min(Math.max(top, margin), maxTop)
    };
  }

  // Positions (and re-positions) a popover using its *actual* rendered size
  // rather than a guessed height estimate, so tall comment threads can never
  // end up straddling the edge of the viewport. If the user has already
  // dragged the popover this session, that saved position wins instead.
  function positionPopover(popover, savedPos, clientX, clientY, heightEstimate) {
    if (isMobileView()) return null;
    var rect = popover.getBoundingClientRect();
    var width = rect.width || Math.min(360, window.innerWidth - 24);
    var height = rect.height || heightEstimate || 300;
    var pos;
    if (savedPos) {
      pos = clampToViewport(savedPos.left, savedPos.top, width, height);
    } else {
      var base = clampPopoverPosition(clientX, clientY, heightEstimate);
      pos = clampToViewport(base.left, base.top, width, height);
    }
    popover.style.left = pos.left + 'px';
    popover.style.top = pos.top + 'px';
    return pos;
  }

  // Lets a user grab a popover by its header and drag it anywhere on screen,
  // so a comment thread never has to stay hidden behind other content or off
  // the edge of the viewport. Ignores drags started on a button (close, etc.)
  function makeDraggable(popover, handle, onChange) {
    if (isMobileView()) return;
    var dragging = false;
    var startX = 0, startY = 0, startLeft = 0, startTop = 0;

    function onPointerMove(e) {
      if (!dragging) return;
      var rect = popover.getBoundingClientRect();
      var pos = clampToViewport(
        startLeft + (e.clientX - startX),
        startTop + (e.clientY - startY),
        rect.width,
        rect.height
      );
      popover.style.left = pos.left + 'px';
      popover.style.top = pos.top + 'px';
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      popover.classList.remove('rv-dragging');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      var rect = popover.getBoundingClientRect();
      if (onChange) onChange({ left: rect.left, top: rect.top });
    }

    handle.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      dragging = true;
      popover.classList.add('rv-dragging');
      var rect = popover.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      e.preventDefault();
    });
  }

  function closeContextMenu() {
    if (state.contextMenu) {
      state.contextMenu.remove();
      state.contextMenu = null;
    }
  }

  function removeDraftPopoverEl() {
    var existing = document.getElementById('rv-popover');
    if (existing) existing.remove();
  }

  function closeDraftPopover() {
    removeDraftPopoverEl();
    state.draft = null;
    draftPopoverPos = null;
    renderPendingPin();
    renderAddHint();
  }

  function removeThreadPopoverEl() {
    var existing = document.getElementById('rv-thread-popover');
    if (existing) existing.remove();
  }

  function onThreadOutsideClick(e) {
    var pop = document.getElementById('rv-thread-popover');
    if (!pop) {
      document.removeEventListener('mousedown', onThreadOutsideClick, true);
      return;
    }
    if (pop.contains(e.target)) return;
    if (e.target.closest && (
      e.target.closest('.rv-pin') ||
      e.target.closest('#rv-panel') ||
      e.target.closest('#rv-confirm') ||
      e.target.closest('.rv-context-menu') ||
      e.target.closest('#rv-root')
    )) return;

    state.activeCommentId = null;
    state.editingCommentId = null;
    closeThreadPopover();
    renderPins();
    if (state.panelOpen) renderPanel();
  }

  function closeThreadPopover() {
    document.removeEventListener('mousedown', onThreadOutsideClick, true);
    removeThreadPopoverEl();
    closeThreadBackdrop();
    threadPopoverPos = null;
  }

  function openContextMenu(clientX, clientY) {
    closeContextMenu();
    closeDraftPopover();
    closeThreadPopover();
    hideTooltip();

    var menu = document.createElement('div');
    menu.className = 'rv-context-menu rv-interactive';
    menu.style.left = clientX + 'px';
    menu.style.top = clientY + 'px';
    menu.innerHTML =
      '<button type="button" class="rv-context-item" id="rv-add-comment">' +
        '<span class="rv-context-icon">+</span> Add comment here' +
      '</button>';

    document.body.appendChild(menu);
    state.contextMenu = menu;

    var rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) menu.style.left = (clientX - rect.width) + 'px';
    if (rect.bottom > window.innerHeight - 8) menu.style.top = (clientY - rect.height) + 'px';

    menu.querySelector('#rv-add-comment').addEventListener('click', function () {
      closeContextMenu();
      openDraftAtPoint(clientX, clientY);
    });
  }

  function openDraftAtPoint(clientX, clientY) {
    var docWidth = document.documentElement.clientWidth;
    var height = docHeight();
    var section = nearestSection(clientY);
    var tabId = getTabIdForPoint(clientX, clientY);
    var anchor = createAnchorFromPoint(clientX, clientY, section.id);

    state.draft = {
      clientX: clientX,
      clientY: clientY,
      sectionId: section.id,
      sectionLabel: section.label,
      tabId: tabId,
      scrollY: window.scrollY,
      pinX: clientX / docWidth,
      pinY: (window.scrollY + clientY) / height,
      // Element anchor is the source of truth for pin placement.
      anchor: anchor
    };

    state.activeCommentId = null;
    renderAll();
  }

  function renderDraftPopover() {
    removeDraftPopoverEl();
    if (!state.draft) return;

    var popover = document.createElement('div');
    popover.id = 'rv-popover';
    popover.className = 'rv-popover rv-interactive';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Add comment');
    popover.setAttribute('aria-modal', 'true');

    popover.innerHTML =
      '<div class="rv-popover-head" title="Drag to move">' +
        '<div><strong>Add comment</strong><span>' + escapeHtml(state.draft.sectionLabel) + '</span></div>' +
        '<button type="button" class="rv-popover-close" id="rv-popover-close" aria-label="Cancel adding comment">&times;</button>' +
      '</div>' +
      '<form id="rv-popover-form">' +
        '<label class="rv-field">' +
          '<span>Your name</span>' +
          '<input name="author" type="text" required maxlength="80" placeholder="Jane Client" value="' + escapeHtml(getStoredName()) + '" aria-label="Your name">' +
        '</label>' +
        '<label class="rv-field">' +
          '<span>What should change?</span>' +
          '<textarea name="body" required maxlength="4000" placeholder="Describe your feedback… (type @ to mention)" aria-label="Comment text"></textarea>' +
        '</label>' +
        '<div class="rv-popover-actions">' +
          '<button type="button" class="rv-btn rv-btn-ghost-dark" id="rv-popover-cancel">Cancel</button>' +
          '<button type="submit" class="rv-btn rv-btn-primary"' + (state.submitting ? ' disabled aria-busy="true"' : '') + '>' +
            (state.submitting ? 'Saving…' : 'Post comment') +
          '</button>' +
        '</div>' +
      '</form>';

    document.body.appendChild(popover);
    positionPopover(popover, draftPopoverPos, state.draft.clientX, state.draft.clientY, 300);
    makeDraggable(popover, popover.querySelector('.rv-popover-head'), function (pos) {
      draftPopoverPos = pos;
    });
    popover.querySelector('#rv-popover-close').addEventListener('click', closeDraftPopover);
    popover.querySelector('#rv-popover-cancel').addEventListener('click', closeDraftPopover);
    popover.querySelector('#rv-popover-form').addEventListener('submit', onSubmitComment);

    var authorField = popover.querySelector('input[name="author"]');
    var bodyField = popover.querySelector('textarea[name="body"]');
    
    bodyField.id = 'draft-textarea';
    bindMentionDetection(bodyField);
    
    if (getStoredName()) bodyField.focus();
    else authorField.focus();
  }

  function generateCommentLink(commentId) {
    var baseUrl = window.location.origin + window.location.pathname;
    return baseUrl + '#comment-' + commentId;
  }

  function copyCommentLink(commentId) {
    var link = generateCommentLink(commentId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link)
        .then(function () {
          showToast('Link copied to clipboard!');
        })
        .catch(function () {
          fallbackCopyLink(link);
        });
    } else {
      fallbackCopyLink(link);
    }
  }

  function fallbackCopyLink(link) {
    var ta = document.createElement('textarea');
    ta.value = link;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Link copied to clipboard!');
    } catch (e) {
      showToast('Could not copy link. Try manually: ' + link, true);
    }
    ta.remove();
  }

  function renderRepliesHtml(replies) {
    if (!replies || !replies.length) {
      return '<div class="rv-thread-empty">No replies yet.</div>';
    }
    return replies.map(function (reply) {
      return (
        '<div class="rv-reply">' +
          '<div class="rv-reply-top">' +
            '<span class="rv-reply-author">' + escapeHtml(reply.authorName) + '</span>' +
            '<span class="rv-reply-time" title="' + escapeHtml(formatTime(reply.createdAt)) + '">' + escapeHtml(formatRelativeTime(reply.createdAt)) + '</span>' +
          '</div>' +
          '<div class="rv-reply-body">' + escapeHtml(reply.body) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function openThreadPopover(comment, clientX, clientY) {
    closeDraftPopover();
    closeContextMenu();
    removeThreadPopoverEl();
    closeThreadBackdrop();
    hideTooltip();

    state.activeCommentId = comment.id;
    // Keep the comments drawer closed — Figma-style: pin click opens only the popover.
    renderBar();
    renderPins();

    var visibleCommentsList = visibleComments();
    var commentIndex = visibleCommentsList.findIndex(function (c) { return c.id === comment.id; });
    var commentNum = commentIndex >= 0 ? commentIndex + 1 : '?';
    var color = commentIndex >= 0 ? getCommentColor(commentIndex) : COMMENT_COLORS[0];
    var resolved = comment.status === 'resolved';
    var editing = state.editingCommentId === comment.id;
    var heightEstimate = editing ? 360 : 420;
    var popover = document.createElement('div');
    popover.id = 'rv-thread-popover';
    popover.className = 'rv-popover rv-thread rv-interactive' + (isMobileView() ? ' rv-popover--sheet' : '');
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Comment thread');

    popover.style.setProperty('--rv-accent', color.hex);
    popover.style.setProperty('--rv-accent-light', color.light);
    popover.style.setProperty('--rv-accent-text', color.text);
    popover.innerHTML =
      '<div class="rv-popover-head rv-popover-head--tinted" title="Drag to move">' +
        '<div class="rv-popover-head-id">' +
          '<span class="rv-popover-avatar">' + escapeHtml((comment.authorName || '?').trim().charAt(0).toUpperCase()) + '</span>' +
          '<div>' +
            '<div class="rv-popover-head-title">' +
              '<strong>' + escapeHtml(comment.authorName) + '</strong>' +
              '<span class="rv-popover-num">#' + commentNum + '</span>' +
            '</div>' +
            '<span class="rv-badge rv-badge-' + (resolved ? 'resolved' : 'open') + '">' +
              (resolved ? 'Resolved' : 'Open') +
            '</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="rv-popover-close" aria-label="Close">&times;</button>' +
        '<button type="button" class="rv-popover-link" onclick="copyCommentLink(\'' + comment.id + '\')" aria-label="Copy comment link" title="Copy shareable link">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
            '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="rv-thread-body">' +
        (comment.sectionLabel ?
          '<div class="rv-card-section">' + escapeHtml(comment.sectionLabel) + '</div>' : '') +
        (comment.tabId && comment.tabId !== 'default' ?
          '<div class="rv-card-section" style="margin-top:2px;"><span class="rv-badge rv-badge-tab">' + humanizeTabId(comment.tabId) + '</span></div>' : '') +
        (isAnchorBroken(comment) || comment.anchorBroken ?
          '<div class="rv-anchor-broken-row">' +
            '<span class="rv-anchor-broken-badge" title="Target element not found.">Anchor broken</span>' +
            '<button type="button" class="rv-btn rv-btn-ghost-dark rv-convert-general">Convert to general feedback</button>' +
          '</div>' : '') +
        (editing ?
          '<form class="rv-edit-form">' +
            '<label class="rv-field"><span>Edit comment</span>' +
              '<textarea name="body" required maxlength="4000">' + escapeHtml(comment.body) + '</textarea>' +
            '</label>' +
            '<div class="rv-popover-actions">' +
              '<button type="button" class="rv-btn rv-btn-ghost-dark rv-edit-cancel">Cancel</button>' +
              '<button type="submit" class="rv-btn rv-btn-primary"' + (state.submitting ? ' disabled' : '') + '>Save</button>' +
            '</div>' +
          '</form>' :
          '<div class="rv-thread-comment">' + escapeHtml(comment.body) + '</div>' +
          '<div class="rv-card-time" title="' + escapeHtml(formatTime(comment.createdAt)) + '">' + 
            escapeHtml(formatRelativeTime(comment.createdAt)) +
            (comment.editHistory && comment.editHistory.length > 1 ? 
              '<button class="rv-edit-indicator" onclick="showEditHistory(\'' + comment.id + '\')" title="View edit history">' +
              '(edited ' + escapeHtml(formatRelativeTime(comment.updatedAt)) + ')' +
              '</button>' : '') +
          '</div>' +
          renderReactionsHtml(comment) +
          '<div class="rv-thread-actions">' +
            '<button type="button" class="rv-btn rv-btn-ghost-dark rv-toggle-status" data-status="' +
              (resolved ? 'open' : 'resolved') + '">' +
              (resolved ? 'Reopen' : 'Mark resolved') +
            '</button>' +
            '<button type="button" class="rv-btn rv-btn-primary-soft rv-edit-comment">Edit comment</button>' +
            '<button type="button" class="rv-btn rv-btn-primary-soft rv-pin-comment" onclick="togglePinComment(\'' + comment.id + '\')" title="' + (comment.pinned ? 'Unpin' : 'Pin') + ' this comment">' +
              (comment.pinned ? '📌 Pinned' : '📌 Pin comment') +
            '</button>' +
          '</div>' +
          '<div class="rv-thread-danger">' +
            '<button type="button" class="rv-delete-link rv-delete-comment"' +
              (state.submitting ? ' disabled' : '') + '>Delete this comment</button>' +
          '</div>') +
        '<div class="rv-thread-replies">' + renderThreadedReplies(comment.replies) + '</div>' +
        '<form class="rv-reply-form">' +
        '<label class="rv-field">' +
          '<span>Your reply</span>' +
          '<textarea name="body" required maxlength="2000" placeholder="Add a reply… (type @ to mention)" aria-label="Your reply text"></textarea>' +
        '</label>' +
          '<input type="hidden" name="author" value="' + escapeHtml(getStoredName()) + '">' +
          '<div class="rv-popover-actions">' +
            '<button type="submit" class="rv-btn rv-btn-primary"' + (state.submitting ? ' disabled aria-busy="true"' : '') + '>Reply</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(popover);
    positionPopover(popover, threadPopoverPos, clientX, clientY, heightEstimate);
    makeDraggable(popover, popover.querySelector('.rv-popover-head'), function (pos) {
      threadPopoverPos = pos;
    });

    popover.querySelector('.rv-popover-close').addEventListener('click', function () {
      state.activeCommentId = null;
      state.editingCommentId = null;
      closeThreadPopover();
      renderPins();
      if (state.panelOpen) renderPanel();
    });

    // Close when clicking the page canvas (not the popover / pins / review chrome).
    document.removeEventListener('mousedown', onThreadOutsideClick, true);
    setTimeout(function () {
      document.addEventListener('mousedown', onThreadOutsideClick, true);
    }, 0);

    var toggleBtn = popover.querySelector('.rv-toggle-status');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        toggleCommentStatus(comment.id, e.target.dataset.status);
      });
    }

    var editBtn = popover.querySelector('.rv-edit-comment');
    if (editBtn) {
      editBtn.addEventListener('click', function () {
        state.editingCommentId = comment.id;
        openThreadPopover(getComment(comment.id), clientX, clientY);
      });
    }

    var editForm = popover.querySelector('.rv-edit-form');
    if (editForm) {
      editForm.querySelector('.rv-edit-cancel').addEventListener('click', function () {
        state.editingCommentId = null;
        openThreadPopover(getComment(comment.id), clientX, clientY);
      });
      editForm.addEventListener('submit', function (e) {
        updateCommentBody(e, comment.id, clientX, clientY);
      });
      editForm.querySelector('textarea').focus();
    }

    var deleteBtn = popover.querySelector('.rv-delete-comment');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        deleteComment(comment.id);
      });
    }

    var convertBtn = popover.querySelector('.rv-convert-general');
    if (convertBtn) {
      convertBtn.addEventListener('click', function () {
        var c = getComment(comment.id);
        if (!c) return;
        c.anchor = null;
        c.legacy = true;
        c.anchorBroken = false;
        c.sectionId = c.sectionId || 'general';
        c.sectionLabel = c.sectionLabel || 'General feedback';
        upsertComment(c);
        if (!isOfflineMode) {
          apiJson('/api/comments/' + encodeURIComponent(c.id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ legacy: true, anchor: null, lastEditedBy: getStoredName() || 'Guest' })
          }).catch(function () {});
        }
        showToast('Converted to general feedback.');
        openThreadPopover(c, clientX, clientY);
        renderPins();
      });
    }

    var replyForm = popover.querySelector('.rv-reply-form');
    var replyTextarea = replyForm.querySelector('textarea[name="body"]');
    if (replyTextarea) {
      replyTextarea.id = 'reply-textarea-' + comment.id;
      bindMentionDetection(replyTextarea);
    }

    replyForm.addEventListener('submit', function (e) {
      onSubmitReply(e, comment.id);
    });
  }

  function refreshOpenThread() {
    if (!state.activeCommentId) return;
    var pop = document.getElementById('rv-thread-popover');
    if (!pop) return;
    var comment = getComment(state.activeCommentId);
    if (!comment) {
      closeThreadPopover();
      return;
    }
    var rect = pop.getBoundingClientRect();
    openThreadPopover(comment, rect.left + 20, rect.top + 20);
  }

  function renderAll() {
    renderBar();
    renderPanel();
    renderPins();
    renderPendingPin();
    renderAddHint();
    renderDraftPopover();
    bindTapMode();
  }

  function bindTapMode() {
    if (tapModeBound) return;
    tapModeBound = true;

    document.addEventListener('click', function (e) {
      if (!state.tapMode || state.submitting) return;
      if (isReviewUiTarget(e.target)) return;
      openDraftAtPoint(e.clientX, e.clientY);
    }, true);
  }

  function closeDraft() {
    state.draft = null;
    renderAll();
  }

  function togglePanel() {
    state.panelOpen = !state.panelOpen;
    renderAll();
  }

  function togglePinsVisibility() {
    state.allPinsVisible = !state.allPinsVisible;
    renderPins();
    showToast(state.allPinsVisible ? 'Comments shown' : 'Comments hidden');
  }

  function toggleTapMode() {
    state.tapMode = !state.tapMode;
    if (!state.tapMode) closeDraft();
    renderAll();
  }

  function focusComment(commentId) {
    var comment = getComment(commentId);
    if (!comment) return;

    state.activeCommentId = commentId;
    state.draft = null;
    // Do not force-open the drawer; panel stays as the user left it.

    var pos = getCommentPinPosition(comment);
    var targetY = pos
      ? pos.topPx - 120
      : (comment.scrollY != null ? comment.scrollY - 80 : 0);
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

    renderBar();
    renderPins();
    if (state.panelOpen) renderPanel();

    setTimeout(function () {
      var latest = getCommentPinPosition(comment);
      if (!latest) return;
      openThreadPopover(comment, latest.clientX, latest.clientY);
    }, 350);
  }

  function upsertComment(comment) {
    var existing = getComment(comment.id);
    if (!existing) {
      comment.replies = comment.replies || [];
      state.comments.push(comment);
    } else {
      comment.replies = comment.replies || existing.replies || [];
      var index = state.comments.findIndex(function (c) { return c.id === comment.id; });
      state.comments[index] = comment;
    }
    state.comments.sort(function (a, b) {
      return a.createdAt.localeCompare(b.createdAt);
    });
    persistLocalBackup();
  }

  function addReplyToComment(commentId, reply) {
    var comment = getComment(commentId);
    if (!comment) return;
    if (!comment.replies) comment.replies = [];
    comment.replies.push(reply);
    comment.replies.sort(function (a, b) {
      return a.createdAt.localeCompare(b.createdAt);
    });
  }

  function removeComment(commentId) {
    state.comments = state.comments.filter(function (c) { return c.id !== commentId; });
    if (state.activeCommentId === commentId) state.activeCommentId = null;
    persistLocalBackup();
  }

  function toggleCommentStatus(commentId, status) {
    if (state.submitting) return;
    state.submitting = true;

    if (isOfflineMode) {
      var c = getComment(commentId);
      if (c) {
        c.status = status;
        c.updatedAt = new Date().toISOString();
        upsertComment(c);
        lsSave();
      }
      state.editingCommentId = null;
      state.submitting = false;
      closeThreadPopover();
      renderAll();
      if (state.activeCommentId === commentId) {
        var updated = getComment(commentId);
        if (updated) openThreadPopover(updated, window.innerWidth / 2, window.innerHeight / 3);
      }
      showToast(status === 'resolved' ? 'Comment resolved.' : 'Comment reopened.');
      return;
    }

    apiJson('/api/comments/' + encodeURIComponent(commentId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    })
      .then(function (data) {
        upsertComment(data.comment);
        state.editingCommentId = null;
        closeThreadPopover();
        renderAll();
        if (state.activeCommentId === commentId) {
          var c = getComment(commentId);
          if (c) openThreadPopover(c, window.innerWidth / 2, window.innerHeight / 3);
        }
        showToast(status === 'resolved' ? 'Comment resolved.' : 'Comment reopened.');
      })
      .catch(function (err) {
        showToast(err.message || 'Could not update comment.', true);
      })
      .finally(function () {
        state.submitting = false;
      });
  }

  function showConflictModal(editorName) {
    var existing = document.getElementById('rv-conflict-modal');
    if (existing) existing.remove();
    var modal = document.createElement('div');
    modal.id = 'rv-conflict-modal';
    modal.className = 'rv-confirm rv-interactive';
    modal.innerHTML =
      '<div class="rv-confirm-box">' +
        '<h3 class="rv-confirm-title">Comment was edited elsewhere</h3>' +
        '<p>' + escapeHtml(editorName || 'Another user') +
          ' is editing / saved changes. Reload to see the latest version. Your draft was not auto-merged.</p>' +
        '<div class="rv-confirm-actions">' +
          '<button type="button" class="rv-btn rv-btn-ghost-dark" id="rv-conflict-dismiss">Keep editing</button>' +
          '<button type="button" class="rv-btn rv-btn-primary" id="rv-conflict-reload">Reload</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('#rv-conflict-dismiss').addEventListener('click', function () {
      modal.remove();
    });
    modal.querySelector('#rv-conflict-reload').addEventListener('click', function () {
      modal.remove();
      syncComments(true).then(function () {
        state.editingCommentId = null;
        closeThreadPopover();
        renderAll();
        showToast('Comments reloaded.');
      });
    });
  }

  function updateCommentBody(e, commentId, clientX, clientY) {
    e.preventDefault();
    if (state.submitting) return;

    var body = e.target.body.value.trim();
    if (!body) {
      showToast('Comment cannot be empty.', true);
      return;
    }

    var existing = getComment(commentId);
    if (existing && existing.lastEditedAt && existing.lastEditedBy &&
        existing.lastEditedBy !== getStoredName()) {
      var editedMs = Date.parse(existing.lastEditedAt);
      if (!isNaN(editedMs) && Date.now() - editedMs < 5000) {
        showConflictModal(existing.lastEditedBy);
        return;
      }
    }

    state.submitting = true;

    if (isOfflineMode) {
      var c = getComment(commentId);
      if (c) {
        trackCommentEdit(commentId, body);
        c.lastEditedBy = getStoredName() || c.authorName;
        c.lastEditedAt = new Date().toISOString();
        upsertComment(c);
        lsSave();
      }
      state.editingCommentId = null;
      state.submitting = false;
      renderAll();
      var updated = getComment(commentId);
      if (updated) openThreadPopover(updated, clientX, clientY);
      showToast('Comment updated.');
      return;
    }

    apiFetch('/api/comments/' + encodeURIComponent(commentId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: body,
        baseUpdatedAt: existing && existing.updatedAt,
        lastEditedBy: getStoredName() || 'Guest'
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (res.status === 409 || data.error === 'conflict') {
            showConflictModal((data.comment && data.comment.lastEditedBy) || data.message);
            if (data.comment) upsertComment(data.comment);
            throw new Error('conflict');
          }
          if (!res.ok) throw new Error(data.error || 'Could not update comment.');
          return data;
        });
      })
      .then(function (data) {
        trackCommentEdit(commentId, body);
        upsertComment(data.comment);
        state.editingCommentId = null;
        renderAll();
        var c = getComment(commentId);
        if (c) openThreadPopover(c, clientX, clientY);
        showToast('Comment updated.');
      })
      .catch(function (err) {
        if (err && err.message === 'conflict') return;
        showToast(err.message || 'Could not update comment.', true);
      })
      .finally(function () {
        state.submitting = false;
      });
  }

  function deleteComment(commentId) {
    if (state.submitting || state.confirmOpen) return;
    var comment = getComment(commentId);
    if (!comment) return;

    confirmAction({
      title: 'Delete this comment?',
      message: 'This permanently removes the comment' +
        ((comment.replies || []).length ? ' and all replies' : '') +
        (isOfflineMode ? ' from this browser.' : ' for everyone on this link.'),
      confirmLabel: 'Yes, delete',
      loadingLabel: 'Deleting…'
    }, function (closeConfirm, restoreConfirm) {
      state.submitting = true;

      if (isOfflineMode) {
        closeConfirm();
        lsRememberDeleted(commentId);
        removeComment(commentId);
        lsSave();
        state.editingCommentId = null;
        state.submitting = false;
        closeThreadPopover();
        renderAll();
        showToast('Comment deleted.');
        return;
      }

      apiJson('/api/comments/' + encodeURIComponent(commentId), { method: 'DELETE' })
        .then(function () {
          closeConfirm();
          lsRememberDeleted(commentId);
          removeComment(commentId);
          state.editingCommentId = null;
          closeThreadPopover();
          renderAll();
          showToast('Comment deleted.');
        })
        .catch(function (err) {
          restoreConfirm();
          showToast(err.message || 'Could not delete comment.', true);
        })
        .finally(function () {
          state.submitting = false;
        });
    });
  }

  function deleteAllComments() {
    if (state.submitting || state.confirmOpen) return;
    if (!state.isOwner && !isOfflineMode) {
      showToast('Only the session owner can delete all comments.', true);
      return;
    }
    var comments = visibleComments();
    if (!comments.length) {
      showToast('No comments to delete on this tab.', true);
      return;
    }

    confirmAction({
      title: 'Delete all comments on this tab?',
      message: 'This will permanently delete ' + comments.length + ' comment' + (comments.length === 1 ? '' : 's') +
        (isOfflineMode ? ' from this browser.' : ' for everyone on this link.') +
        ' This action is audited.',
      confirmLabel: 'Yes, delete all',
      loadingLabel: 'Deleting…'
    }, function (closeConfirm, restoreConfirm) {
      state.submitting = true;

      if (isOfflineMode) {
        closeConfirm();
        comments.forEach(function (c) {
          lsRememberDeleted(c.id);
          removeComment(c.id);
        });
        lsSave();
        state.editingCommentId = null;
        state.panelFilter = 'all';
        state.panelSearch = '';
        closeThreadPopover();
        renderAll();
        showToast('All comments deleted.');
        console.log('[review] audit delete_all', { count: comments.length, userId: state.userId });
        return;
      }

      var deletePromises = comments.map(function (c) {
        return apiJson('/api/comments/' + encodeURIComponent(c.id), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'delete_all', userId: state.userId })
        }).catch(function (err) {
          console.warn('Failed to delete comment ' + c.id + ':', err.message);
          return Promise.resolve();
        });
      });

      Promise.all(deletePromises)
        .then(function () {
          closeConfirm();
          comments.forEach(function (c) {
            lsRememberDeleted(c.id);
            removeComment(c.id);
          });
          state.editingCommentId = null;
          state.panelFilter = 'all';
          state.panelSearch = '';
          closeThreadPopover();
          renderAll();
          showToast('All comments deleted.');
          console.log('[review] audit delete_all', { count: comments.length, userId: state.userId });
        })
        .catch(function (err) {
          restoreConfirm();
          showToast(err.message || 'Could not delete all comments.', true);
        })
        .finally(function () {
          state.submitting = false;
        });
    });
  }

  function deleteMyCommentsOnly() {
    if (state.submitting || state.confirmOpen) return;
    var myName = getStoredName();
    var comments = visibleComments().filter(function (c) {
      return (c.authorUserId && c.authorUserId === state.userId) ||
        (myName && c.authorName === myName);
    });
    if (!comments.length) {
      showToast('No comments of yours to delete on this view.', true);
      return;
    }

    confirmAction({
      title: 'Delete your comments only?',
      message: 'This deletes ' + comments.length + ' of your comment' +
        (comments.length === 1 ? '' : 's') + '. Other people’s feedback stays.',
      confirmLabel: 'Delete mine',
      loadingLabel: 'Deleting…'
    }, function (closeConfirm, restoreConfirm) {
      state.submitting = true;
      var finish = function () {
        closeConfirm();
        comments.forEach(function (c) {
          lsRememberDeleted(c.id);
          removeComment(c.id);
        });
        closeThreadPopover();
        renderAll();
        showToast('Your comments were deleted.');
        console.log('[review] audit delete_mine', { count: comments.length, userId: state.userId });
        state.submitting = false;
      };

      if (isOfflineMode) {
        finish();
        return;
      }

      Promise.all(comments.map(function (c) {
        return apiJson('/api/comments/' + encodeURIComponent(c.id), {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'delete_mine', userId: state.userId })
        }).catch(function () { return null; });
      })).then(finish).catch(function (err) {
        restoreConfirm();
        state.submitting = false;
        showToast(err.message || 'Could not delete comments.', true);
      });
    });
  }

  function exportCommentsJson() {
    var comments = pageComments().map(function (c) {
      return {
        id: c.id,
        body: c.body,
        author: c.authorName,
        status: c.status,
        pagePath: c.pagePath,
        sectionId: c.sectionId,
        tabId: c.tabId,
        anchor: c.anchor || null,
        createdAt: c.createdAt,
        replies: (c.replies || []).map(function (r) {
          return {
            id: r.id,
            body: r.body,
            author: r.authorName,
            createdAt: r.createdAt
          };
        })
      };
    });
    if (!comments.length) {
      showToast('No comments to export.', true);
      return;
    }
    var blob = new Blob([JSON.stringify({
      sessionId: state.token,
      exportedAt: new Date().toISOString(),
      comments: comments
    }, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = state.token + '_comments.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Exported ' + comments.length + ' comment' + (comments.length === 1 ? '' : 's') + '.');
  }

  function exportFeedback() {
    var comments = pageComments();
    if (!comments.length) {
      showToast('No comments to export yet.', true);
      return;
    }
    var lines = ['=== Design Feedback ===', 'Page: ' + PAGE_PATH, ''];
    comments.forEach(function (c, i) {
      lines.push((i + 1) + '. ' + c.authorName + ', ' + (c.sectionLabel || 'General'));
      lines.push('   ' + c.body);
      if (c.status === 'resolved') lines.push('   [Resolved]');
      (c.replies || []).forEach(function (r) {
        lines.push('   \u21b3 ' + r.authorName + ': ' + r.body);
      });
      lines.push('');
    });
    var text = lines.join('\n');
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('Feedback copied to clipboard!'); }
      catch (e) { showToast('Select all and copy from the Comments panel.', true); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Feedback copied to clipboard!');
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  function connectEvents() {
    if (isOfflineMode) return;
    if (state.eventSource) {
      state.eventSource.close();
      state.eventSource = null;
    }
    if (sseRetryTimer) {
      clearTimeout(sseRetryTimer);
      sseRetryTimer = null;
    }

    var es = new EventSource('/api/sessions/' + encodeURIComponent(state.token) + '/events');
    state.eventSource = es;

    es.addEventListener('connected', function () {
      state.connected = true;
      renderBar();
      syncComments(true);
    });

    es.addEventListener('comment_created', function (event) {
      var data = JSON.parse(event.data);
      if (data.comment) upsertComment(data.comment);
      renderAll();
    });

    es.addEventListener('comment_updated', function (event) {
      var data = JSON.parse(event.data);
      if (data.comment) {
        var incoming = data.comment;
        var local = getComment(incoming.id);
        if (state.editingCommentId === incoming.id && local &&
            incoming.lastEditedBy && incoming.lastEditedBy !== getStoredName()) {
          var incomingMs = Date.parse(incoming.lastEditedAt || incoming.updatedAt || '');
          if (!isNaN(incomingMs) && Date.now() - incomingMs < 5000) {
            showConflictModal(incoming.lastEditedBy);
          }
        }
        upsertComment(incoming);
      }
      renderAll();
    });

    es.addEventListener('comment_deleted', function (event) {
      var data = JSON.parse(event.data);
      if (data.commentId) lsRememberDeleted(data.commentId);
      removeComment(data.commentId);
      closeThreadPopover();
      renderAll();
    });

    es.addEventListener('reply_created', function (event) {
      var data = JSON.parse(event.data);
      addReplyToComment(data.commentId, data.reply);
      renderAll();
      refreshOpenThread();
    });

    es.onerror = function () {
      state.connected = false;
      renderBar();
      es.close();
      state.eventSource = null;
      sseRetryTimer = setTimeout(connectEvents, 3000);
    };
  }

  function commentsFingerprint(comments) {
    return comments.map(function (c) {
      var replyCount = (c.replies || []).length;
      var replyTail = replyCount ? c.replies[replyCount - 1].id : '';
      return c.id + ':' + c.updatedAt + ':' + c.status + ':' + c.body.length + ':' +
        replyCount + ':' + replyTail;
    }).join('|');
  }

  function syncComments(silent) {
    if (isOfflineMode || state.confirmOpen) return Promise.resolve();
    return loadComments().then(function () {
      state.syncError = false;
      var fp = commentsFingerprint(state.comments);
      if (fp !== lastSyncFingerprint) {
        lastSyncFingerprint = fp;
        renderAll();
        refreshOpenThread();
      } else {
        renderPins();
      }
    }).catch(function () {
      state.connected = false;
      state.syncError = true;
      renderBar();
    });
  }

  function startSyncLoop() {
    if (isOfflineMode) return;
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      syncComments(true);
    }, 2000);
  }

  function loadComments() {
    if (isOfflineMode) {
      var stored = lsLoad();
      var merged = mergeCommentLists([], stored.comments || state.comments || [], lsLoadDeleted());
      state.comments = merged.length ? merged : (stored.comments || state.comments || []);
      persistLocalBackup();
      lastSyncFingerprint = commentsFingerprint(state.comments);
      return Promise.resolve();
    }
    var url = '/api/sessions/' + encodeURIComponent(state.token) +
      '/comments?_=' + Date.now();
    return apiFetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load comments');
        return res.json();
      })
      .then(function (data) {
        return applyRemoteComments(data.comments || []).then(function () {
          lastSyncFingerprint = commentsFingerprint(state.comments);
        });
      })
      .catch(function () {
        // Keep any in-memory comments and merge with local backup — never wipe.
        // Do not permanently latch offline here; a brief API blip should recover
        // on the next poll. Hard offline is set only when the session itself fails.
        state.connected = false;
        var stored = lsLoad();
        var merged = mergeCommentLists(
          state.comments || [],
          stored.comments || [],
          lsLoadDeleted()
        );
        state.comments = merged;
        persistLocalBackup();
        lastSyncFingerprint = commentsFingerprint(state.comments);
      });
  }

  function loadSession() {
    return apiFetch('/api/sessions/' + encodeURIComponent(state.token))
      .then(function (res) {
        if (!res.ok) throw new Error('no-backend');
        return res.json();
      })
      .then(function (data) {
        state.session = data.session;
        state.syncError = false;
        return apiJson('/api/sessions/' + encodeURIComponent(state.token) + '/claim-owner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: state.userId })
        }).then(function (claim) {
          if (claim && claim.session) state.session = claim.session;
          state.isOwner = !!(claim && claim.isOwner) ||
            !!(state.session && state.session.ownerUserId === state.userId);
        }).catch(function () {
          state.isOwner = !!(state.session && state.session.ownerUserId === state.userId);
        });
      })
      .catch(function () {
        isOfflineMode = true;
        state.session = { title: 'Design Review', token: state.token };
        // Offline: first browser visitor becomes local owner for this token.
        try {
          var ownerKey = 'rv-owner-' + state.token;
          var owner = localStorage.getItem(ownerKey);
          if (!owner) {
            localStorage.setItem(ownerKey, state.userId);
            state.isOwner = true;
          } else {
            state.isOwner = owner === state.userId;
          }
        } catch (e) {
          state.isOwner = true;
        }
      });
  }

  function onSubmitComment(e) {
    e.preventDefault();
    if (!state.draft || state.submitting) return;

    var form = e.target;
    var authorName = form.author.value.trim();
    var body = form.body.value.trim();

    if (!authorName || !body) {
      showToast('Please enter your name and comment.', true);
      return;
    }

    setStoredName(authorName);
    state.submitting = true;
    renderDraftPopover();

    var draftSnapshot = state.draft;

    function finishLocalSave(message, isError) {
      var now = new Date().toISOString();
      var newComment = {
        id: genId(),
        authorName: authorName,
        body: body,
        pagePath: PAGE_PATH,
        sectionId: draftSnapshot.sectionId,
        sectionLabel: draftSnapshot.sectionLabel,
        tabId: draftSnapshot.tabId,
        scrollY: draftSnapshot.scrollY,
        pinX: draftSnapshot.pinX,
        pinY: draftSnapshot.pinY,
        anchor: draftSnapshot.anchor || null,
        authorUserId: state.userId,
        status: 'open',
        createdAt: now,
        updatedAt: now,
        lastEditedBy: authorName,
        lastEditedAt: now,
        replies: [],
        _pendingSync: isOfflineMode ? false : 'create'
      };
      upsertComment(newComment);
      lsSave();
      state.draft = null;
      state.activeCommentId = newComment.id;
      state.submitting = false;
      renderAll();
      showToast(message, !!isError);
      openThreadPopover(newComment, draftSnapshot.clientX, draftSnapshot.clientY);
    }

    if (isOfflineMode) {
      finishLocalSave('Comment saved in this browser.');
      return;
    }

    apiJson('/api/sessions/' + encodeURIComponent(state.token) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName: authorName,
        body: body,
        pagePath: PAGE_PATH,
        sectionId: draftSnapshot.sectionId,
        sectionLabel: draftSnapshot.sectionLabel,
        tabId: draftSnapshot.tabId,
        scrollY: draftSnapshot.scrollY,
        pinX: draftSnapshot.pinX,
        pinY: draftSnapshot.pinY,
        anchor: draftSnapshot.anchor || null,
        authorUserId: state.userId
      })
    })
      .then(function (data) {
        data.comment.replies = data.comment.replies || [];
        data.comment.anchor = data.comment.anchor || draftSnapshot.anchor || null;
        data.comment._pendingSync = false;
        upsertComment(data.comment);
        state.draft = null;
        state.activeCommentId = data.comment.id;
        renderAll();
        showToast('Comment saved.');
        openThreadPopover(data.comment, draftSnapshot.clientX, draftSnapshot.clientY);
      })
      .catch(function () {
        // Never lose the comment — persist locally and retry on next sync.
        finishLocalSave('Saved locally — will sync when connection returns.', true);
      })
      .finally(function () {
        state.submitting = false;
        renderDraftPopover();
      });
  }

  function onSubmitReply(e, commentId) {
    e.preventDefault();
    if (state.submitting) return;

    var form = e.target;
    var authorName = form.author.value.trim() || getStoredName();
    var body = form.body.value.trim();

    if (!body) {
      showToast('Please enter a reply.', true);
      return;
    }

    setStoredName(authorName);
    state.submitting = true;

    if (isOfflineMode) {
      var now = new Date().toISOString();
      var reply = {
        id: genId(),
        authorName: authorName,
        body: body,
        createdAt: now
      };
      addReplyToComment(commentId, reply);
      lsSave();
      form.body.value = '';
      state.submitting = false;
      renderAll();
      refreshOpenThread();
      showToast('Reply added.');
      return;
    }

    apiJson('/api/comments/' + encodeURIComponent(commentId) + '/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: authorName, body: body })
    })
      .then(function (data) {
        addReplyToComment(commentId, data.reply);
        form.body.value = '';
        renderAll();
        refreshOpenThread();
        showToast('Reply added.');
      })
      .catch(function (err) {
        showToast(err.message || 'Could not submit reply.', true);
      })
      .finally(function () {
        state.submitting = false;
      });
  }

  document.addEventListener('contextmenu', function (e) {
    if (isReviewUiTarget(e.target)) return;
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY);
  });

  document.addEventListener('click', function (e) {
    if (state.contextMenu && !e.target.closest('.rv-context-menu')) {
      closeContextMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var confirmEl = document.getElementById('rv-confirm');
      if (confirmEl) {
        state.confirmOpen = false;
        confirmEl.remove();
        return;
      }
      closeContextMenu();
      if (state.draft) closeDraft();
      else if (document.getElementById('rv-thread-popover')) {
        state.activeCommentId = null;
        closeThreadPopover();
        renderPins();
      }
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var cards = Array.from(document.querySelectorAll('.rv-card'));
      if (!cards.length) return;
      var focused = document.activeElement;
      var isCardFocused = focused && focused.classList.contains('rv-card');
      if (!isCardFocused && focused !== document.body) return;
      
      var currentIdx = cards.indexOf(focused);
      var nextIdx = currentIdx;
      if (e.key === 'ArrowDown') {
        nextIdx = Math.min(currentIdx + 1, cards.length - 1);
      } else {
        nextIdx = Math.max(currentIdx - 1, 0);
      }
      if (nextIdx !== currentIdx) {
        cards[nextIdx].focus();
        e.preventDefault();
      }
    }

    if (e.key === 'Enter') {
      var focused = document.activeElement;
      if (focused && focused.classList.contains('rv-card')) {
        focused.click();
        e.preventDefault();
      }
      if (focused && focused.id === 'reply-textarea' && (e.ctrlKey || e.metaKey)) {
        var form = focused.closest('.rv-reply-form');
        if (form) form.querySelector('button[type="submit"]').click();
        e.preventDefault();
      }
    }
  });

  var lastTabId = getCurrentTabId();
  setInterval(function () {
    var currentTabId = getCurrentTabId();
    if (currentTabId !== lastTabId) {
      lastTabId = currentTabId;
      state.activeCommentId = null;
      closeThreadPopover();
      renderAll();
    }
  }, 300);

  function handleDeepLink() {
    var hash = window.location.hash;
    if (hash.startsWith('#comment-')) {
      var commentId = hash.substring(9);
      var comment = getComment(commentId);
      if (comment) {
        focusComment(commentId);
        highlightComment(commentId);
      }
    }
  }

  function highlightComment(commentId) {
    var card = document.querySelector('[data-id="' + commentId + '"]');
    if (card) {
      card.classList.add('rv-highlighted');
      setTimeout(function () {
        card.classList.remove('rv-highlighted');
      }, 3000);
    }
  }

  function renderReactionsHtml(comment) {
    if (!comment.reactions || Object.keys(comment.reactions).length === 0) {
      return '';
    }
    
    return '<div class="rv-comment-reactions">' + 
      Object.keys(comment.reactions).map(function (emoji) {
        var count = comment.reactions[emoji];
        return '<button class="rv-reaction" onclick="toggleReaction(\'' + comment.id + '\', \'' + emoji + '\')" title="' + emoji + ' (' + count + ')">' +
          '<span class="rv-reaction-emoji">' + emoji + '</span>' +
          '<span class="rv-reaction-count">' + count + '</span>' +
        '</button>';
      }).join('') +
      '<button class="rv-reaction-add" onclick="showEmojiPicker(\'' + comment.id + '\')" title="Add reaction" aria-label="Add emoji reaction">' +
        '<span>+</span>' +
      '</button>' +
    '</div>';
  }

  function toggleReaction(commentId, emoji) {
    if (state.submitting) return;
    var comment = getComment(commentId);
    if (!comment) return;

    if (!comment.reactions) comment.reactions = {};
    if (!comment.reactions[emoji]) {
      comment.reactions[emoji] = 0;
    }

    comment.reactions[emoji]++;
    upsertComment(comment);

    if (!isOfflineMode) {
      apiJson('/api/comments/' + encodeURIComponent(commentId) + '/reactions/' + encodeURIComponent(emoji), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji: emoji })
      }).then(function (data) {
        if (data && data.comment) upsertComment(data.comment);
        refreshOpenThread();
      }).catch(function (err) {
        // Roll back optimistic bump
        comment.reactions[emoji] = Math.max(0, (comment.reactions[emoji] || 1) - 1);
        if (!comment.reactions[emoji]) delete comment.reactions[emoji];
        upsertComment(comment);
        showToast('Could not add reaction: ' + (err.message || 'request failed'), true);
        refreshOpenThread();
      });
    }

    refreshOpenThread();
    renderPins();
  }

  function showEmojiPicker(commentId) {
    var existing = document.querySelector('.rv-emoji-picker');
    if (existing) existing.remove();

    var picker = document.createElement('div');
    picker.className = 'rv-emoji-picker rv-interactive';
    picker.setAttribute('role', 'menu');
    picker.setAttribute('aria-label', 'Select emoji reaction');

    picker.innerHTML = EMOJI_REACTIONS.map(function (emoji) {
      return '<button type="button" class="rv-emoji-option" role="menuitem" onclick="toggleReaction(\'' + commentId + '\', \'' + emoji + '\')">' + 
        emoji + 
      '</button>';
    }).join('');

    document.body.appendChild(picker);

    var rect = picker.getBoundingClientRect();
    if (rect.right > window.innerWidth - 12) {
      picker.style.right = '12px';
      picker.style.left = 'auto';
    }
    if (rect.bottom > window.innerHeight - 12) {
      picker.style.bottom = '12px';
      picker.style.top = 'auto';
    }

    setTimeout(function () {
      document.addEventListener('click', closeEmojiPicker);
    }, 10);
  }

  function closeEmojiPicker() {
    var picker = document.querySelector('.rv-emoji-picker');
    if (picker) picker.remove();
    document.removeEventListener('click', closeEmojiPicker);
  }

  window.toggleReaction = toggleReaction;
  window.showEmojiPicker = showEmojiPicker;

  function detectMentionQuery(text) {
    var lastWord = text.split(/\s+/).pop();
    if (lastWord.startsWith('@')) {
      var query = lastWord.slice(1).toLowerCase();
      if (query.length > 0) {
        return { query: query, startIndex: text.lastIndexOf('@') };
      }
    }
    return null;
  }

  function getMentionMatches(query) {
    return TEAM_MEMBERS.filter(function (member) {
      return member.name.toLowerCase().includes(query);
    });
  }

  function showMentionDropdown(textarea, matches, startIndex) {
    closeMentionDropdown();

    if (!matches.length) return;

    var dropdown = document.createElement('div');
    dropdown.className = 'rv-mention-dropdown rv-interactive';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-label', 'Team member suggestions');

    dropdown.innerHTML = matches.map(function (member) {
      return '<button type="button" class="rv-mention-item" role="option" ' +
        'onclick="insertMention(\'' + textarea.id + '\', \'' + member.name + '\')" ' +
        'title="Mention ' + member.name + '">' +
        '<span class="rv-mention-avatar">' + member.name.charAt(0).toUpperCase() + '</span>' +
        '<span class="rv-mention-name">' + escapeHtml(member.name) + '</span>' +
      '</button>';
    }).join('');

    textarea.parentElement.appendChild(dropdown);

    var textareaRect = textarea.getBoundingClientRect();
    dropdown.style.top = (textareaRect.bottom + 4) + 'px';
    dropdown.style.left = textareaRect.left + 'px';
    dropdown.style.width = Math.min(300, textareaRect.width) + 'px';

    dropdown.classList.add('visible');
  }

  function closeMentionDropdown() {
    var dropdown = document.querySelector('.rv-mention-dropdown');
    if (dropdown) {
      dropdown.classList.remove('visible');
      setTimeout(function () {
        var d = document.querySelector('.rv-mention-dropdown');
        if (d) d.remove();
      }, 150);
    }
  }

  function insertMention(textareaId, memberName) {
    var textarea = document.getElementById(textareaId);
    var text = textarea.value;
    var lastAt = text.lastIndexOf('@');
    
    if (lastAt !== -1) {
      var beforeAt = text.substring(0, lastAt);
      var after = text.substring(lastAt).split(/\s+/, 1)[0];
      var afterWord = text.substring(lastAt + after.length);
      textarea.value = beforeAt + '@' + memberName + ' ' + afterWord.trim();
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    }

    closeMentionDropdown();
  }

  function bindMentionDetection(textarea) {
    var mentionTimeout;

    textarea.addEventListener('input', function (e) {
      clearTimeout(mentionTimeout);
      
      mentionTimeout = setTimeout(function () {
        var query = detectMentionQuery(textarea.value);
        
        if (query) {
          var matches = getMentionMatches(query.query);
          if (matches.length > 0) {
            showMentionDropdown(textarea, matches, query.startIndex);
          } else {
            closeMentionDropdown();
          }
        } else {
          closeMentionDropdown();
        }
      }, 100);
    });

    textarea.addEventListener('keydown', function (e) {
      var dropdown = document.querySelector('.rv-mention-dropdown');
      if (!dropdown || !dropdown.classList.contains('visible')) return;

      if (e.key === 'Escape') {
        closeMentionDropdown();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        var items = dropdown.querySelectorAll('.rv-mention-item');
        var focused = dropdown.querySelector('.rv-mention-item:focus');
        if (!focused && items.length > 0) {
          items[0].focus();
        } else {
          var nextIdx = Array.prototype.indexOf.call(items, focused) + 1;
          if (nextIdx < items.length) items[nextIdx].focus();
        }
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        var items = dropdown.querySelectorAll('.rv-mention-item');
        var focused = dropdown.querySelector('.rv-mention-item:focus');
        if (focused) {
          var prevIdx = Array.prototype.indexOf.call(items, focused) - 1;
          if (prevIdx >= 0) items[prevIdx].focus();
        }
        e.preventDefault();
      } else if (e.key === 'Enter') {
        var focused = dropdown.querySelector('.rv-mention-item:focus');
        if (focused) {
          focused.click();
          e.preventDefault();
        }
      }
    });
  }

  window.insertMention = insertMention;
  window.bindMentionDetection = bindMentionDetection;

  function togglePinComment(commentId) {
    var comment = getComment(commentId);
    if (!comment) return;

    var nextPinned = !comment.pinned;
    comment.pinned = nextPinned;
    upsertComment(comment);

    if (!isOfflineMode) {
      apiJson('/api/comments/' + encodeURIComponent(commentId) + '/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: nextPinned })
      }).then(function (data) {
        if (data && data.comment) upsertComment(data.comment);
        refreshOpenThread();
        renderAll();
      }).catch(function (err) {
        comment.pinned = !nextPinned;
        upsertComment(comment);
        showToast('Could not update pin status: ' + (err.message || 'request failed'), true);
        refreshOpenThread();
        renderAll();
      });
      return;
    }

    refreshOpenThread();
    renderAll();
  }

  function markAllResolved() {
    var openComments = visibleComments().filter(function (c) {
      return c.status === 'open';
    });

    if (!openComments.length) {
      showToast('No open comments to resolve.', true);
      return;
    }

    if (!confirm('Mark all ' + openComments.length + ' open comment(s) as resolved?')) {
      return;
    }

    if (state.submitting) return;
    state.submitting = true;

    if (isOfflineMode) {
      openComments.forEach(function (c) {
        c.status = 'resolved';
        c.updatedAt = new Date().toISOString();
        upsertComment(c);
      });
      lsSave();
      state.submitting = false;
      renderAll();
      showToast('All comments marked resolved.');
      return;
    }

    var resolvePromises = openComments.map(function (c) {
      return apiJson('/api/comments/' + encodeURIComponent(c.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      }).catch(function (err) {
        console.warn('Failed to resolve comment ' + c.id + ':', err.message);
        return Promise.resolve();
      });
    });

    Promise.all(resolvePromises)
      .then(function () {
        openComments.forEach(function (c) {
          c.status = 'resolved';
          upsertComment(c);
        });
        renderAll();
        showToast('All comments marked resolved.');
      })
      .catch(function (err) {
        showToast('Error marking comments resolved: ' + err.message, true);
      })
      .finally(function () {
        state.submitting = false;
      });
  }

  window.togglePinComment = togglePinComment;
  window.markAllResolved = markAllResolved;
  window.deleteAllComments = deleteAllComments;

  function renderThreadedReplies(replies, depth) {
    depth = depth || 0;
    if (!replies || !replies.length) {
      return '<div class="rv-thread-empty">No replies yet.</div>';
    }

    return '<div class="rv-replies-container" style="margin-left:' + (depth * 20) + 'px">' +
      replies.map(function (reply) {
        return (
          '<div class="rv-reply' + (depth > 0 ? ' rv-reply-nested' : '') + '">' +
            '<div class="rv-reply-top">' +
              '<span class="rv-reply-author">' + escapeHtml(reply.authorName) + '</span>' +
              '<span class="rv-reply-time" title="' + escapeHtml(formatTime(reply.createdAt)) + '">' + 
                escapeHtml(formatRelativeTime(reply.createdAt)) + '</span>' +
            '</div>' +
            '<div class="rv-reply-body">' + escapeHtml(reply.body) + '</div>' +
            (reply.replies && reply.replies.length > 0 ? 
              renderThreadedReplies(reply.replies, depth + 1) : '') +
          '</div>'
        );
      }).join('') +
    '</div>';
  }

  window.renderThreadedReplies = renderThreadedReplies;

  function showEditHistory(commentId) {
    var comment = getComment(commentId);
    if (!comment) return;

    var existing = document.getElementById('rv-edit-history-modal');
    if (existing) existing.remove();

    var history = comment.editHistory || [];
    if (!history.length) {
      showToast('No edit history available.', true);
      return;
    }

    var modal = document.createElement('div');
    modal.id = 'rv-edit-history-modal';
    modal.className = 'rv-modal rv-interactive';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'rv-edit-history-title');

    modal.innerHTML =
      '<div class="rv-modal-content">' +
        '<div class="rv-modal-head">' +
          '<h2 id="rv-edit-history-title">Edit History - Comment #' + commentId.slice(0, 8) + '</h2>' +
          '<button type="button" class="rv-modal-close" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="rv-modal-body">' +
          history.map(function (entry, idx) {
            var isOriginal = idx === history.length - 1;
            return (
              '<div class="rv-history-entry">' +
                '<div class="rv-history-meta">' +
                  '<strong>' + (isOriginal ? 'Original' : 'Edited') + '</strong>' +
                  '<time>' + escapeHtml(formatTime(entry.timestamp)) + '</time>' +
                  (entry.editorName ? '<span class="rv-history-editor">by ' + escapeHtml(entry.editorName) + '</span>' : '') +
                '</div>' +
                (idx < history.length - 1 ?
                  '<div class="rv-history-diff">' +
                    '<div class="rv-diff-before"><strong>Before:</strong><p>' + escapeHtml(history[idx + 1].text) + '</p></div>' +
                    '<div class="rv-diff-arrow">→</div>' +
                    '<div class="rv-diff-after"><strong>After:</strong><p>' + escapeHtml(entry.text) + '</p></div>' +
                  '</div>' :
                  '<div class="rv-history-text">' + escapeHtml(entry.text) + '</div>') +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.querySelector('.rv-modal-close').addEventListener('click', function () {
      modal.remove();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.remove();
    });
  }

  function trackCommentEdit(commentId, newText) {
    var comment = getComment(commentId);
    if (!comment) return;

    if (!comment.editHistory) {
      comment.editHistory = [
        { text: comment.body, timestamp: comment.createdAt, editorName: comment.authorName }
      ];
    }

    comment.editHistory.unshift({
      text: newText,
      timestamp: new Date().toISOString(),
      editorName: getStoredName()
    });

    comment.body = newText;
    comment.updatedAt = new Date().toISOString();
  }

  window.showEditHistory = showEditHistory;
  window.trackCommentEdit = trackCommentEdit;

  window.addEventListener('hashchange', handleDeepLink);

  function showCorruptRecoveryModal() {
    var existing = document.getElementById('rv-corrupt-modal');
    if (existing) existing.remove();
    var modal = document.createElement('div');
    modal.id = 'rv-corrupt-modal';
    modal.className = 'rv-confirm rv-interactive';
    modal.innerHTML =
      '<div class="rv-confirm-box">' +
        '<h3 class="rv-confirm-title">Comment storage corrupted</h3>' +
        '<p>Local comment data looks corrupted. Restore from backup, or start fresh?</p>' +
        '<div class="rv-confirm-actions">' +
          '<button type="button" class="rv-btn rv-btn-ghost-dark" id="rv-corrupt-fresh">Start fresh</button>' +
          '<button type="button" class="rv-btn rv-btn-primary" id="rv-corrupt-restore">Restore</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('#rv-corrupt-fresh').addEventListener('click', function () {
      try {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_BAK_KEY);
      } catch (e) {}
      state.comments = [];
      persistLocalBackup();
      modal.remove();
      renderAll();
      showToast('Started with an empty comment list.');
    });
    modal.querySelector('#rv-corrupt-restore').addEventListener('click', function () {
      var bak = tryBackupLoad(false);
      if (bak.comments && bak.comments.length) {
        state.comments = bak.comments;
        persistLocalBackup();
        modal.remove();
        renderAll();
        showToast('Restored ' + bak.comments.length + ' comments from backup.');
      } else {
        modal.remove();
        showToast('No usable backup found. Start fresh?', true);
        showCorruptRecoveryModal();
      }
    });
  }

  // Hydrate immediately from local backup so a slow/failed API never blanks the UI.
  (function hydrateFromBackup() {
    var stored = lsLoad();
    if (stored.corrupted && !(stored.comments && stored.comments.length)) {
      setTimeout(showCorruptRecoveryModal, 300);
      return;
    }
    if (stored.recoveredFromCorrupt && stored.comments && stored.comments.length) {
      setTimeout(function () {
        confirmAction({
          title: 'Corrupted. Restore?',
          message: 'Primary storage was corrupted. Restore ' + stored.comments.length +
            ' comment(s) from backup?',
          confirmLabel: 'Restore',
          loadingLabel: 'Restoring…'
        }, function (closeConfirm) {
          closeConfirm();
          state.comments = stored.comments.slice();
          persistLocalBackup();
          renderAll();
          showToast('Restored from backup.');
        });
      }, 300);
    }
    if (stored.comments && stored.comments.length) {
      state.comments = stored.comments.slice();
      lastSyncFingerprint = commentsFingerprint(state.comments);
      renderAll();
    }
  })();

  loadSession()
    .then(function () { return loadComments(); })
    .then(function () {
      if (isMobileView()) state.tapMode = true;
      var migration = migrateAllComments();
      var broken = verifyAnchors();
      if (migration.total) {
        showToast(
          'Migrated ' + migration.success + '/' + migration.total +
          ' legacy comment anchors' +
          (migration.failed ? ' (' + migration.failed + ' failed)' : '') + '.'
        );
      }
      if (broken.length) {
        showToast(broken.length + ' comment(s) have broken anchors.', true);
      }
      renderAll();
      startSyncLoop();
      connectEvents();
      if (!isOfflineMode) flushPendingComments();
      if (isOfflineMode && state.comments.length) {
        showToast('Only saved locally — keep this tab open until you reconnect.', true);
      }
      
      handleDeepLink();
      showWelcomeTip();
    })
    .catch(function (err) {
      document.body.classList.remove('review-mode');
      document.body.classList.remove('rv-add-mode');
      root.innerHTML =
        '<div class="rv-bar rv-interactive">' +
          '<div class="rv-bar-title">Review link unavailable</div>' +
        '</div>';
      showToast(err.message || 'This review link is not valid.', true);
    });

  function showWelcomeTip() {
    var seenKey = 'rv-welcome-seen' + (isOfflineMode ? '-offline' : '');
    try {
      if (localStorage.getItem(seenKey)) return;
      localStorage.setItem(seenKey, '1');
    } catch (e) {
      return;
    }
    setTimeout(function () {
      if (isOfflineMode) {
        showToast(isMobileView()
          ? 'Tap + Add to leave feedback. Comments are saved in this browser.'
          : 'Right-click anywhere to leave feedback. Use \u201cCopy Feedback\u201d to share your notes.');
      } else {
        showToast(isMobileView()
          ? 'Tap + Add, then tap the page to leave a comment.'
          : 'Right-click anywhere on the page to leave a comment.');
      }
    }, 600);
  }

  var pinRelayoutTimer = null;
  function schedulePinRelayout() {
    if (pinRelayoutTimer) clearTimeout(pinRelayoutTimer);
    pinRelayoutTimer = setTimeout(function () {
      pinRelayoutTimer = null;
      renderPins();
      renderPendingPin();
    }, 50);
  }

  function startAnchorLayoutObservers() {
    window.addEventListener('resize', function () {
      schedulePinRelayout();
      if (state.draft) renderDraftPopover();
      var openThread = document.getElementById('rv-thread-popover');
      if (openThread && threadPopoverPos) {
        threadPopoverPos = positionPopover(openThread, threadPopoverPos, 0, 0, 420) || threadPopoverPos;
      }
    });

    window.addEventListener('scroll', function () {
      // Anchored pins use document coordinates, so scroll alone does not
      // require a full rebuild — but pending pins / tooltips still need care.
      renderPendingPin();
      hideTooltip();
    }, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      try {
        var resizeObserver = new ResizeObserver(function () {
          schedulePinRelayout();
        });
        resizeObserver.observe(document.documentElement);
        if (document.body) resizeObserver.observe(document.body);
      } catch (e) {}
    }

    if (typeof MutationObserver !== 'undefined' && document.body) {
      try {
        var mutationObserver = new MutationObserver(function (mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (m.type === 'attributes' && m.target && m.target.closest &&
                m.target.closest(REVIEW_UI_SELECTOR)) {
              continue;
            }
            if (m.type === 'childList') {
              var nodes = [];
              if (m.addedNodes && m.addedNodes.length) {
                for (var a = 0; a < m.addedNodes.length; a++) nodes.push(m.addedNodes[a]);
              }
              if (m.removedNodes && m.removedNodes.length) {
                for (var r = 0; r < m.removedNodes.length; r++) nodes.push(m.removedNodes[r]);
              }
              var onlyReviewUi = nodes.length > 0 && nodes.every(function (node) {
                return node.nodeType === 1 && (
                  (node.id && String(node.id).indexOf('rv-') === 0) ||
                  (node.classList && (
                    node.classList.contains('rv-pin') ||
                    node.classList.contains('rv-interactive') ||
                    node.classList.contains('rv-pin-layer')
                  )) ||
                  (node.closest && node.closest(REVIEW_UI_SELECTOR))
                );
              });
              if (onlyReviewUi) continue;
            }
            schedulePinRelayout();
            return;
          }
        });
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style', 'hidden', 'aria-hidden']
        });
      } catch (e) {}
    }

    // Fonts / late images can shift layout after first paint.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedulePinRelayout).catch(function () {});
    }
    window.addEventListener('load', schedulePinRelayout);
  }

  startAnchorLayoutObservers();

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      syncComments(true);
      schedulePinRelayout();
    }
  });

  window.addEventListener('focus', function () {
    syncComments(true);
    schedulePinRelayout();
  });

  } /* initReviewMode */
})();
