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
    { id: 'gather-difference', label: 'Connected Workflow' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' }
  ];

  function detectSections() {
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

  var params = new URLSearchParams(window.location.search);
  var reviewToken = params.get('review');
  if (!reviewToken) return;

  initReviewMode(reviewToken);

  function initReviewMode(reviewToken) {
  var SECTIONS = detectSections();
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
    confirmOpen: false
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

  function apiFetch(url, options) {
    options = options || {};
    options.cache = 'no-store';
    options.headers = Object.assign({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }, options.headers || {});
    return fetch(url, options);
  }

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
    var best = SECTIONS[0];
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

  function getComment(commentId) {
    return state.comments.find(function (c) { return c.id === commentId; }) || null;
  }

  function openCount() {
    return state.comments.filter(function (c) { return c.status === 'open'; }).length;
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
          (isOfflineMode && state.comments.length
            ? '<button type="button" class="rv-btn rv-btn-ghost" id="rv-export-btn">' +
                '<span class="rv-btn-long">Copy Feedback</span><span class="rv-btn-short">Copy</span>' +
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
    var exportBtn = root.querySelector('#rv-export-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportFeedback);
    document.body.classList.toggle('rv-add-mode', state.tapMode);
  }

  function renderCommentCards() {
    if (!state.comments.length) {
      var hint = isMobileView() ?
        'Tap <strong>+ Add</strong>, then tap anywhere on the page.' :
        '<strong>Right-click</strong> anywhere on the page to leave feedback.';
      return '<div class="rv-empty">No comments yet. ' + hint + '</div>';
    }

    return state.comments.slice().reverse().map(function (comment) {
      var resolved = comment.status === 'resolved';
      var active = comment.id === state.activeCommentId ? ' active' : '';
      var replyCount = (comment.replies || []).length;
      return (
        '<article class="rv-card' + (resolved ? ' resolved' : '') + active + '" data-id="' + comment.id + '">' +
          '<div class="rv-card-top">' +
            '<span class="rv-card-author">' + escapeHtml(comment.authorName) + '</span>' +
            '<span class="rv-badge rv-badge-' + (resolved ? 'resolved' : 'open') + '">' +
              (resolved ? 'Resolved' : 'Open') +
            '</span>' +
          '</div>' +
          (comment.sectionLabel || comment.sectionId ?
            '<div class="rv-card-section">' + escapeHtml(comment.sectionLabel || sectionLabel(comment.sectionId)) + '</div>' : '') +
          '<div class="rv-card-body">' + escapeHtml(comment.body) + '</div>' +
          '<div class="rv-card-foot">' +
            '<span class="rv-card-time">' + escapeHtml(formatTime(comment.createdAt)) +
              (replyCount ? ' · ' + replyCount + ' repl' + (replyCount === 1 ? 'y' : 'ies') : '') +
            '</span>' +
            '<span class="rv-card-open-hint">View</span>' +
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
    panel.setAttribute('aria-label', 'Review comments');

    panel.innerHTML =
      '<div class="rv-panel-head">' +
        '<div class="rv-panel-head-row">' +
          '<h2>All comments</h2>' +
          '<button type="button" class="rv-panel-close" aria-label="Close comments panel">&times;</button>' +
        '</div>' +
        '<p>Click a comment to jump to it on the page.</p>' +
      '</div>' +
      '<div class="rv-list" id="rv-list">' + renderCommentCards() + '</div>';

    document.body.appendChild(panel);

    panel.querySelector('.rv-panel-close').addEventListener('click', function () {
      state.panelOpen = false;
      renderAll();
    });

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
    var height = docHeight();
    var pinNumber = 0;

    state.comments.forEach(function (comment) {
      if (comment.pinX == null || comment.pinY == null) return;
      pinNumber += 1;

      var pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'rv-pin' +
        (comment.status === 'resolved' ? ' resolved' : '') +
        (comment.id === state.activeCommentId ? ' active' : '');
      pin.style.top = (comment.pinY * height) + 'px';
      pin.style.left = (comment.pinX * 100) + 'vw';
      pin.textContent = String(pinNumber);
      pin.setAttribute('aria-label', 'Comment by ' + comment.authorName);

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

  function closeContextMenu() {
    if (state.contextMenu) {
      state.contextMenu.remove();
      state.contextMenu = null;
    }
  }

  function closeDraftPopover() {
    var existing = document.getElementById('rv-popover');
    if (existing) existing.remove();
    state.draft = null;
    renderPendingPin();
    renderAddHint();
  }

  function closeThreadPopover() {
    var existing = document.getElementById('rv-thread-popover');
    if (existing) existing.remove();
    closeThreadBackdrop();
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

    state.draft = {
      clientX: clientX,
      clientY: clientY,
      sectionId: section.id,
      sectionLabel: section.label,
      scrollY: window.scrollY,
      pinX: clientX / docWidth,
      pinY: (window.scrollY + clientY) / height
    };

    state.activeCommentId = null;
    renderAll();
  }

  function renderDraftPopover() {
    var existing = document.getElementById('rv-popover');
    if (existing) existing.remove();
    if (!state.draft) return;

    var pos = clampPopoverPosition(state.draft.clientX, state.draft.clientY);
    var popover = document.createElement('div');
    popover.id = 'rv-popover';
    popover.className = 'rv-popover rv-interactive';
    popover.style.left = pos.left + 'px';
    popover.style.top = pos.top + 'px';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Add comment');

    popover.innerHTML =
      '<div class="rv-popover-head">' +
        '<div><strong>Add comment</strong><span>' + escapeHtml(state.draft.sectionLabel) + '</span></div>' +
        '<button type="button" class="rv-popover-close" id="rv-popover-close" aria-label="Cancel">&times;</button>' +
      '</div>' +
      '<form id="rv-popover-form">' +
        '<label class="rv-field">' +
          '<span>Your name</span>' +
          '<input name="author" type="text" required maxlength="80" placeholder="Jane Client" value="' + escapeHtml(getStoredName()) + '">' +
        '</label>' +
        '<label class="rv-field">' +
          '<span>What should change?</span>' +
          '<textarea name="body" required maxlength="4000" placeholder="Describe your feedback…"></textarea>' +
        '</label>' +
        '<div class="rv-popover-actions">' +
          '<button type="button" class="rv-btn rv-btn-ghost-dark" id="rv-popover-cancel">Cancel</button>' +
          '<button type="submit" class="rv-btn rv-btn-primary"' + (state.submitting ? ' disabled' : '') + '>' +
            (state.submitting ? 'Saving…' : 'Post comment') +
          '</button>' +
        '</div>' +
      '</form>';

    document.body.appendChild(popover);
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
            '<span class="rv-reply-time">' + escapeHtml(formatTime(reply.createdAt)) + '</span>' +
          '</div>' +
          '<div class="rv-reply-body">' + escapeHtml(reply.body) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function openThreadPopover(comment, clientX, clientY) {
    closeDraftPopover();
    closeContextMenu();
    closeThreadPopover();
    hideTooltip();

    state.activeCommentId = comment.id;
    if (!isMobileView()) state.panelOpen = true;
    renderBar();
    renderPanel();
    renderPins();
    openThreadBackdrop();

    var resolved = comment.status === 'resolved';
    var editing = state.editingCommentId === comment.id;
    var pos = clampPopoverPosition(clientX, clientY, editing ? 360 : 420);
    var popover = document.createElement('div');
    popover.id = 'rv-thread-popover';
    popover.className = 'rv-popover rv-thread rv-interactive' + (isMobileView() ? ' rv-popover--sheet' : '');
    popover.style.left = pos.left + 'px';
    popover.style.top = pos.top + 'px';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Comment thread');

    popover.innerHTML =
      '<div class="rv-popover-head">' +
        '<div>' +
          '<strong>' + escapeHtml(comment.authorName) + '</strong>' +
          '<span class="rv-badge rv-badge-' + (resolved ? 'resolved' : 'open') + '">' +
            (resolved ? 'Resolved' : 'Open') +
          '</span>' +
        '</div>' +
        '<button type="button" class="rv-popover-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="rv-thread-body">' +
        (comment.sectionLabel ?
          '<div class="rv-card-section">' + escapeHtml(comment.sectionLabel) + '</div>' : '') +
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
          '<div class="rv-card-time">' + escapeHtml(formatTime(comment.createdAt)) + '</div>' +
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
            '<span>Reply as</span>' +
            '<input name="author" type="text" required maxlength="80" value="' + escapeHtml(getStoredName()) + '">' +
          '</label>' +
          '<label class="rv-field">' +
            '<span>Your reply</span>' +
            '<textarea name="body" required maxlength="2000" placeholder="Add a reply…"></textarea>' +
          '</label>' +
          '<div class="rv-popover-actions">' +
            '<button type="submit" class="rv-btn rv-btn-primary"' + (state.submitting ? ' disabled' : '') + '>Reply</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(popover);

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

  function exportFeedback() {
    if (!state.comments.length) {
      showToast('No comments to export yet.', true);
      return;
    }
    var lines = ['=== Design Feedback ===', ''];
    state.comments.forEach(function (c, i) {
      lines.push((i + 1) + '. ' + c.authorName + ' — ' + (c.sectionLabel || 'General'));
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
        sectionId: state.draft.sectionId,
        sectionLabel: state.draft.sectionLabel,
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
      showToast('Comment saved — visible only in this browser.');
      renderDraftPopover();
      return;
    }

    apiJson('/api/sessions/' + encodeURIComponent(state.token) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName: authorName,
        body: body,
        sectionId: state.draft.sectionId,
        sectionLabel: state.draft.sectionLabel,
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
        showToast('Comment saved — visible to everyone on this link.');
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
    var authorName = form.author.value.trim();
    var body = form.body.value.trim();

    if (!authorName) {
      showToast('Please enter your name.', true);
      return;
    }
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
  });

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
