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

    apiFetch('/api/review-default')
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        var token = data && data.session && data.session.token;
        if (!token) return;
        ensureReviewQuery(token);
        preserveReviewOnLinks(token);
        initReviewMode(token);
      })
      .catch(function () {});
  }

  function apiFetch(url, options) {
    options = options || {};
    options.cache = 'no-store';
    options.headers = Object.assign({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
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
    eventSource: null,
    submitting: false,
    confirmOpen: false,
    allPinsVisible: true,
    panelFilter: 'all',
    panelSearch: ''
  };

  var isOfflineMode = false;
  var LS_KEY = 'rv-offline-' + reviewToken;

  function lsLoad() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : { comments: [] };
    } catch (e) { return { comments: [] }; }
  }

  function lsSave() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ comments: state.comments }));
    } catch (e) {}
  }

  function genId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
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

  function getCurrentTabId() {
    var journeyRoot = document.getElementById('product-journey');
    if (journeyRoot) {
      var activePanel = journeyRoot.querySelector('.journey-panel.is-active');
      if (activePanel) {
        // Prefer actual ID if it exists, otherwise use data-journey-panel attribute, then fall back to index
        if (activePanel.id) return activePanel.id;
        var journeyAttr = activePanel.getAttribute('data-journey-panel');
        if (journeyAttr) return 'journey-panel-' + journeyAttr;
        return 'journey-' + Array.prototype.indexOf.call(
          journeyRoot.querySelectorAll('.journey-panel'),
          activePanel
        );
      }
    }

    var pillarsRoot = document.getElementById('three-pillars');
    if (pillarsRoot) {
      var activePanel = pillarsRoot.querySelector('.pillars-panel-content.is-active');
      if (activePanel) {
        // Prefer actual ID if it exists, otherwise use data-pillar-panel attribute, then fall back to index
        if (activePanel.id) return activePanel.id;
        var pillarAttr = activePanel.getAttribute('data-pillar-panel');
        if (pillarAttr) return 'pillar-' + pillarAttr;
        return 'pillars-' + Array.prototype.indexOf.call(
          pillarsRoot.querySelectorAll('.pillars-panel-content'),
          activePanel
        );
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
    // If comment has no tabId, assign it to 'default' (backward compatibility for legacy comments)
    var commentTabId = comment.tabId || 'default';
    return commentTabId === getCurrentTabId();
  }

  function pageComments() {
    return state.comments.filter(isCommentOnCurrentPage);
  }

  function visibleComments() {
    return pageComments().filter(isCommentOnActiveTab);
  }

  function getComment(commentId) {
    return state.comments.find(function (c) { return c.id === commentId; }) || null;
  }

  function openCount() {
    return visibleComments().filter(function (c) { return c.status === 'open'; }).length;
  }

  function renderBar() {
    var title = state.session ? state.session.title : 'Review mode';
    var statusClass = isOfflineMode ? ' offline' : (state.connected ? '' : ' offline');
    var statusLabel = isOfflineMode ? 'Offline' : (state.connected ? 'Live' : 'Syncing');
    var subLabel = isMobileView()
      ? 'Tap + Add, then tap the page · Pin = view comment'
      : (isOfflineMode
          ? 'Right-click to add · Comments saved in this browser'
          : 'Right-click to add · Click a pin to view or edit');

    root.innerHTML =
      '<div class="rv-bar rv-interactive">' +
        '<div class="rv-bar-brand">' +
          '<span class="rv-bar-dot"></span>' +
          '<div>' +
            '<div class="rv-bar-title">' + escapeHtml(title) + '</div>' +
            '<div class="rv-bar-sub">' + subLabel + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rv-bar-actions">' +
          '<span class="rv-status rv-status--desktop"><span class="rv-status-dot' + statusClass + '"></span>' +
            statusLabel + '</span>' +
          (isOfflineMode && pageComments().length
            ? '<button type="button" class="rv-btn rv-btn-ghost" id="rv-export-btn">' +
                '<span class="rv-btn-long">Copy Feedback</span><span class="rv-btn-short">Copy</span>' +
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
    if (exportBtn) exportBtn.addEventListener('click', exportFeedback);
    document.body.classList.toggle('rv-add-mode', state.tapMode);
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
      return (
        '<article class="rv-card' + (resolved ? ' resolved' : '') + (isOwner ? ' owner' : '') + active + '" ' +
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

    function tab(key, label, count) {
      return '<button type="button" class="rv-filter-tab' + (filter === key ? ' active' : '') + '" ' +
        'data-filter="' + key + '" ' +
        'role="tab" ' +
        'aria-selected="' + (filter === key ? 'true' : 'false') + '" ' +
        'aria-controls="rv-list">' +
        label + '<span class="rv-filter-count" aria-hidden="true">' + count + '</span>' +
      '</button>';
    }

    panel.innerHTML =
      '<div class="rv-panel-head">' +
        '<div class="rv-panel-head-row">' +
          '<h2>Comments <span class="rv-panel-total">' + all.length + '</span></h2>' +
          '<button type="button" class="rv-panel-close" aria-label="Close comments panel">&times;</button>' +
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
            '<button type="button" class="rv-panel-delete-all" title="Delete all comments on this tab">Delete all</button>' +
          '</div>' : '') +
      '</div>' +
      '<div class="rv-list" id="rv-list" role="region" aria-label="Comments list" aria-live="polite">' + renderCommentCards() + '</div>';

    document.body.appendChild(panel);

    panel.querySelector('.rv-panel-close').addEventListener('click', function () {
      state.panelOpen = false;
      renderAll();
    });

    var deleteAllBtn = panel.querySelector('.rv-panel-delete-all');
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', deleteAllComments);
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
    closeThreadBackdrop();
    var backdrop = document.createElement('div');
    backdrop.id = 'rv-thread-backdrop';
    backdrop.className = 'rv-thread-backdrop rv-interactive';
    backdrop.addEventListener('click', function () {
      state.activeCommentId = null;
      state.editingCommentId = null;
      closeThreadPopover();
      closeThreadBackdrop();
      renderPins();
      renderPanel();
    });
    document.body.appendChild(backdrop);
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
    
    var height = docHeight();
    var visibleCommentsList = visibleComments();
    var pinNumber = 0;

    visibleCommentsList.forEach(function (comment) {
      if (comment.pinX == null || comment.pinY == null) return;
      pinNumber += 1;

      var color = getCommentColor(visibleCommentsList.indexOf(comment));
      var pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'rv-pin' +
        (comment.status === 'resolved' ? ' resolved' : '') +
        (comment.id === state.activeCommentId ? ' active' : '');
      pin.style.top = (comment.pinY * height) + 'px';
      pin.style.left = (comment.pinX * 100) + 'vw';
      pin.style.backgroundColor = color.hex;
      pin.style.borderColor = '#fff';
      pin.textContent = String(pinNumber);
      pin.setAttribute('aria-label', 'Comment #' + pinNumber + ' by ' + comment.authorName);
      pin.setAttribute('data-comment-id', comment.id);

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

    var marker = document.createElement('div');
    marker.id = 'rv-pending-pin';
    marker.className = 'rv-pending-pin';
    marker.style.top = (state.draft.pinY * docHeight()) + 'px';
    marker.style.left = (state.draft.pinX * 100) + 'vw';
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

  function closeThreadPopover() {
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
    var tabId = getCurrentTabId();

    state.draft = {
      clientX: clientX,
      clientY: clientY,
      sectionId: section.id,
      sectionLabel: section.label,
      tabId: tabId,
      scrollY: window.scrollY,
      pinX: clientX / docWidth,
      pinY: (window.scrollY + clientY) / height
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
          '<textarea name="body" required maxlength="4000" placeholder="Describe your feedback…" aria-label="Comment text"></textarea>' +
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
    if (getStoredName()) bodyField.focus();
    else authorField.focus();
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
    hideTooltip();

    state.activeCommentId = comment.id;
    if (!isMobileView()) state.panelOpen = true;
    renderBar();
    renderPanel();
    renderPins();
    openThreadBackdrop();

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
      '</div>' +
      '<div class="rv-thread-body">' +
        (comment.sectionLabel ?
          '<div class="rv-card-section">' + escapeHtml(comment.sectionLabel) + '</div>' : '') +
        (comment.tabId && comment.tabId !== 'default' ?
          '<div class="rv-card-section" style="margin-top:2px;"><span class="rv-badge rv-badge-tab">' + humanizeTabId(comment.tabId) + '</span></div>' : '') +
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
          '<div class="rv-card-time" title="' + escapeHtml(formatTime(comment.createdAt)) + '">' + escapeHtml(formatRelativeTime(comment.createdAt)) + '</div>' +
          '<div class="rv-thread-actions">' +
            '<button type="button" class="rv-btn rv-btn-ghost-dark rv-toggle-status" data-status="' +
              (resolved ? 'open' : 'resolved') + '">' +
              (resolved ? 'Reopen' : 'Mark resolved') +
            '</button>' +
            '<button type="button" class="rv-btn rv-btn-primary-soft rv-edit-comment">Edit comment</button>' +
          '</div>' +
          '<div class="rv-thread-danger">' +
            '<button type="button" class="rv-delete-link rv-delete-comment"' +
              (state.submitting ? ' disabled' : '') + '>Delete this comment</button>' +
          '</div>') +
        '<div class="rv-thread-replies">' + renderRepliesHtml(comment.replies) + '</div>' +
        '<form class="rv-reply-form">' +
          '<label class="rv-field">' +
            '<span>Your reply</span>' +
            '<textarea name="body" required maxlength="2000" placeholder="Add a reply…" aria-label="Your reply text"></textarea>' +
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
      renderPanel();
    });

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

    popover.querySelector('.rv-reply-form').addEventListener('submit', function (e) {
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
    state.panelOpen = true;

    var height = docHeight();
    var targetY = comment.pinY != null ? (comment.pinY * height - 120) : comment.scrollY - 80;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

    renderAll();

    setTimeout(function () {
      if (comment.pinX != null && comment.pinY != null) {
        var x = comment.pinX * document.documentElement.clientWidth;
        var y = comment.pinY * height - window.scrollY;
        openThreadPopover(comment, x, y);
      }
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

  function updateCommentBody(e, commentId, clientX, clientY) {
    e.preventDefault();
    if (state.submitting) return;

    var body = e.target.body.value.trim();
    if (!body) {
      showToast('Comment cannot be empty.', true);
      return;
    }

    state.submitting = true;

    if (isOfflineMode) {
      var c = getComment(commentId);
      if (c) {
        c.body = body;
        c.updatedAt = new Date().toISOString();
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

    apiJson('/api/comments/' + encodeURIComponent(commentId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body })
    })
      .then(function (data) {
        upsertComment(data.comment);
        state.editingCommentId = null;
        renderAll();
        var c = getComment(commentId);
        if (c) openThreadPopover(c, clientX, clientY);
        showToast('Comment updated.');
      })
      .catch(function (err) {
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
    var comments = visibleComments();
    if (!comments.length) {
      showToast('No comments to delete on this tab.', true);
      return;
    }

    confirmAction({
      title: 'Delete all comments on this tab?',
      message: 'This will permanently delete ' + comments.length + ' comment' + (comments.length === 1 ? '' : 's') +
        (isOfflineMode ? ' from this browser.' : ' for everyone on this link.'),
      confirmLabel: 'Yes, delete all',
      loadingLabel: 'Deleting…'
    }, function (closeConfirm, restoreConfirm) {
      state.submitting = true;

      if (isOfflineMode) {
        closeConfirm();
        comments.forEach(function (c) { removeComment(c.id); });
        lsSave();
        state.editingCommentId = null;
        state.panelFilter = 'all';
        state.panelSearch = '';
        closeThreadPopover();
        renderAll();
        showToast('All comments deleted.');
        return;
      }

      var deletePromises = comments.map(function (c) {
        return apiJson('/api/comments/' + encodeURIComponent(c.id), { method: 'DELETE' })
          .catch(function (err) {
            console.warn('Failed to delete comment ' + c.id + ':', err.message);
            return Promise.resolve(); // continue even if one fails
          });
      });

      Promise.all(deletePromises)
        .then(function () {
          closeConfirm();
          comments.forEach(function (c) { removeComment(c.id); });
          state.editingCommentId = null;
          state.panelFilter = 'all';
          state.panelSearch = '';
          closeThreadPopover();
          renderAll();
          showToast('All comments deleted.');
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
      if (data.comment) upsertComment(data.comment);
      renderAll();
    });

    es.addEventListener('comment_deleted', function (event) {
      var data = JSON.parse(event.data);
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
      state.comments = stored.comments || [];
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
        state.comments = data.comments || [];
        lastSyncFingerprint = commentsFingerprint(state.comments);
      })
      .catch(function () {
        isOfflineMode = true;
        var stored = lsLoad();
        state.comments = stored.comments || [];
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
      })
      .catch(function () {
        isOfflineMode = true;
        state.session = { title: 'Design Review', token: state.token };
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

    if (isOfflineMode) {
      var now = new Date().toISOString();
      var newComment = {
        id: genId(),
        authorName: authorName,
        body: body,
        pagePath: PAGE_PATH,
        sectionId: state.draft.sectionId,
        sectionLabel: state.draft.sectionLabel,
        tabId: state.draft.tabId,
        scrollY: state.draft.scrollY,
        pinX: state.draft.pinX,
        pinY: state.draft.pinY,
        status: 'open',
        createdAt: now,
        updatedAt: now,
        replies: []
      };
      upsertComment(newComment);
      lsSave();
      state.draft = null;
      state.activeCommentId = newComment.id;
      state.panelOpen = true;
      state.submitting = false;
      renderAll();
      showToast('Comment saved, visible only in this browser.');
      renderDraftPopover();
      return;
    }

    apiJson('/api/sessions/' + encodeURIComponent(state.token) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName: authorName,
        body: body,
        pagePath: PAGE_PATH,
        sectionId: state.draft.sectionId,
        sectionLabel: state.draft.sectionLabel,
        tabId: state.draft.tabId,
        scrollY: state.draft.scrollY,
        pinX: state.draft.pinX,
        pinY: state.draft.pinY
      })
    })
      .then(function (data) {
        data.comment.replies = data.comment.replies || [];
        upsertComment(data.comment);
        state.draft = null;
        state.activeCommentId = data.comment.id;
        state.panelOpen = true;
        renderAll();
        showToast('Comment saved, visible to everyone on this link.');
      })
      .catch(function (err) {
        showToast(err.message || 'Could not submit comment.', true);
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

  loadSession()
    .then(function () { return loadComments(); })
    .then(function () {
      if (isMobileView()) state.tapMode = true;
      renderAll();
      startSyncLoop();
      connectEvents();
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

  window.addEventListener('resize', function () {
    renderPins();
    renderPendingPin();
    if (state.draft) renderDraftPopover();
    var openThread = document.getElementById('rv-thread-popover');
    if (openThread && threadPopoverPos) {
      threadPopoverPos = positionPopover(openThread, threadPopoverPos, 0, 0, 420) || threadPopoverPos;
    }
  });

  window.addEventListener('scroll', function () {
    renderPins();
    renderPendingPin();
    hideTooltip();
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) syncComments(true);
  });

  window.addEventListener('focus', function () {
    syncComments(true);
  });

  } /* initReviewMode */
})();
