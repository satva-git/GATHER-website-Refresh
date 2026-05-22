(function () {
  'use strict';

  var SECTIONS = [
    { id: 'top', label: 'Hero / Top' },
    { id: 'the-problem', label: 'The Problem' },
    { id: 'the-solution', label: 'The Solution' },
    { id: 'three-pillars', label: 'Three Pillars' },
    { id: 'data-integrity', label: '4 Levels / Data Integrity' },
    { id: 'intercompany-control', label: 'Intercompany Control' },
    { id: 'group-reporting', label: 'Group Reporting' },
    { id: 'group-planning', label: 'Group Planning' },
    { id: 'platform-features', label: 'Platform Features' },
    { id: 'gather-difference', label: 'GATHER Difference' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' }
  ];

  var REVIEW_UI_SELECTOR = [
    '#rv-root',
    '#rv-panel',
    '#rv-popover',
    '#rv-pending-pin',
    '.rv-pin',
    '.rv-add-hint'
  ].join(',');

  var params = new URLSearchParams(window.location.search);
  var reviewToken = params.get('review');
  if (!reviewToken) return;

  var state = {
    token: reviewToken,
    session: null,
    comments: [],
    panelOpen: false,
    addMode: true,
    draft: null,
    activeCommentId: null,
    connected: false,
    eventSource: null,
    submitting: false
  };

  var root = document.createElement('div');
  root.id = 'rv-root';
  document.body.appendChild(root);
  document.body.classList.add('review-mode');

  var pinLayer = document.createElement('div');
  pinLayer.className = 'rv-pin-layer';
  pinLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pinLayer);

  var toastEl = document.createElement('div');
  toastEl.className = 'rv-toast';
  toastEl.setAttribute('role', 'status');
  root.appendChild(toastEl);

  var toastTimer = null;
  var pageClickBound = false;

  function showToast(message, isError) {
    toastEl.textContent = message;
    toastEl.classList.toggle('error', !!isError);
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3200);
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

  function renderBar() {
    var title = state.session ? state.session.title : 'Review mode';
    var statusClass = state.connected ? '' : ' offline';
    root.innerHTML =
      '<div class="rv-bar rv-interactive">' +
        '<div class="rv-bar-brand">' +
          '<span class="rv-bar-dot"></span>' +
          '<div>' +
            '<div class="rv-bar-title">' + escapeHtml(title) + '</div>' +
            '<div class="rv-bar-sub">' +
              (state.addMode
                ? 'Click anywhere on the page to point and add a comment'
                : 'Turn on Add comment to point at any spot on the page') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rv-bar-actions">' +
          '<span class="rv-status"><span class="rv-status-dot' + statusClass + '"></span>' +
            (state.connected ? 'Live' : 'Reconnecting') + '</span>' +
          '<button type="button" class="rv-btn rv-btn-primary' + (state.addMode ? ' active' : '') + '" id="rv-add-btn">Add comment</button>' +
          '<button type="button" class="rv-btn rv-btn-ghost" id="rv-panel-btn">' +
            (state.panelOpen ? 'Hide' : 'All') + ' (' + state.comments.length + ')' +
          '</button>' +
        '</div>' +
      '</div>' +
      toastEl.outerHTML;

    toastEl = root.querySelector('.rv-toast');
    root.querySelector('#rv-add-btn').addEventListener('click', toggleAddMode);
    root.querySelector('#rv-panel-btn').addEventListener('click', togglePanel);
    document.body.classList.toggle('rv-add-mode', state.addMode);
  }

  function renderPanel() {
    var existing = document.getElementById('rv-panel');
    if (existing) existing.remove();

    var panel = document.createElement('aside');
    panel.id = 'rv-panel';
    panel.className = 'rv-panel rv-interactive' + (state.panelOpen ? ' open' : '');
    panel.setAttribute('aria-label', 'Review comments');

    panel.innerHTML =
      '<div class="rv-panel-head">' +
        '<h2>All comments</h2>' +
        '<p>Click any pin on the page, or use Add comment to point at a new spot.</p>' +
      '</div>' +
      '<div class="rv-list" id="rv-list">' + renderCommentCards() + '</div>';

    document.body.appendChild(panel);

    panel.querySelectorAll('.rv-card').forEach(function (card) {
      card.addEventListener('click', function () {
        focusComment(card.dataset.id);
      });
    });
  }

  function renderCommentCards() {
    if (!state.comments.length) {
      return '<div class="rv-empty">No comments yet. Click <strong>Add comment</strong>, then point anywhere on the page.</div>';
    }

    return state.comments.slice().reverse().map(function (comment) {
      var resolved = comment.status === 'resolved';
      var active = comment.id === state.activeCommentId ? ' active' : '';
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
          '<div class="rv-card-time">' + escapeHtml(formatTime(comment.createdAt)) + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderPins() {
    pinLayer.innerHTML = '';
    var docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    var pinNumber = 0;

    state.comments.forEach(function (comment) {
      if (comment.pinX == null || comment.pinY == null) return;
      pinNumber += 1;

      var pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'rv-pin' +
        (comment.status === 'resolved' ? ' resolved' : '') +
        (comment.id === state.activeCommentId ? ' active' : '');
      pin.style.top = (comment.pinY * docHeight) + 'px';
      pin.style.left = (comment.pinX * 100) + 'vw';
      pin.textContent = String(pinNumber);
      pin.title = comment.authorName + ': ' + comment.body.slice(0, 80);
      pin.addEventListener('click', function (e) {
        e.stopPropagation();
        focusComment(comment.id);
      });
      pinLayer.appendChild(pin);
    });
  }

  function renderPendingPin() {
    var existing = document.getElementById('rv-pending-pin');
    if (existing) existing.remove();
    if (!state.draft) return;

    var docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    var marker = document.createElement('div');
    marker.id = 'rv-pending-pin';
    marker.className = 'rv-pending-pin rv-interactive';
    marker.style.top = (state.draft.pinY * docHeight) + 'px';
    marker.style.left = (state.draft.pinX * 100) + 'vw';
    marker.setAttribute('aria-hidden', 'true');
    document.body.appendChild(marker);
  }

  function renderAddHint() {
    var existing = document.getElementById('rv-add-hint');
    if (existing) existing.remove();
    if (!state.addMode || state.draft) return;

    var hint = document.createElement('div');
    hint.id = 'rv-add-hint';
    hint.className = 'rv-add-hint rv-interactive';
    hint.textContent = 'Click anywhere on the page to place a comment';
    document.body.appendChild(hint);
  }

  function clampPopoverPosition(clientX, clientY) {
    var width = Math.min(340, window.innerWidth - 24);
    var height = 280;
    var left = clientX + 16;
    var top = clientY + 16;

    if (left + width > window.innerWidth - 12) {
      left = clientX - width - 16;
    }
    if (left < 12) left = 12;

    if (top + height > window.innerHeight - 12) {
      top = clientY - height - 16;
    }
    if (top < 64) top = 64;

    return { left: left, top: top };
  }

  function renderPopover() {
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
        '<div>' +
          '<strong>Add comment here</strong>' +
          '<span>' + escapeHtml(state.draft.sectionLabel) + '</span>' +
        '</div>' +
        '<button type="button" class="rv-popover-close" id="rv-popover-close" aria-label="Cancel">&times;</button>' +
      '</div>' +
      '<form id="rv-popover-form">' +
        '<label class="rv-field">' +
          '<span>Your name</span>' +
          '<input name="author" type="text" required maxlength="80" placeholder="Jane Client" value="' + escapeHtml(getStoredName()) + '">' +
        '</label>' +
        '<label class="rv-field">' +
          '<span>Comment</span>' +
          '<textarea name="body" required maxlength="4000" placeholder="What should change here?"></textarea>' +
        '</label>' +
        '<div class="rv-popover-actions">' +
          '<button type="button" class="rv-btn rv-btn-ghost-dark" id="rv-popover-cancel">Cancel</button>' +
          '<button type="submit" class="rv-btn rv-btn-primary"' + (state.submitting ? ' disabled' : '') + '>Submit</button>' +
        '</div>' +
      '</form>';

    document.body.appendChild(popover);

    popover.querySelector('#rv-popover-close').addEventListener('click', closeDraft);
    popover.querySelector('#rv-popover-cancel').addEventListener('click', closeDraft);
    popover.querySelector('#rv-popover-form').addEventListener('submit', onSubmitComment);

    var authorField = popover.querySelector('input[name="author"]');
    var bodyField = popover.querySelector('textarea[name="body"]');
    if (getStoredName()) bodyField.focus();
    else authorField.focus();
  }

  function renderAll() {
    renderBar();
    renderPanel();
    renderPins();
    renderPendingPin();
    renderAddHint();
    renderPopover();
    bindPageClick();
  }

  function bindPageClick() {
    if (pageClickBound) return;
    pageClickBound = true;

    document.addEventListener('click', function (e) {
      if (!state.addMode || state.submitting) return;
      if (isReviewUiTarget(e.target)) return;

      openDraftAtPoint(e.clientX, e.clientY);
    }, true);
  }

  function openDraftAtPoint(clientX, clientY) {
    var docWidth = document.documentElement.clientWidth;
    var docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    var section = nearestSection(clientY);

    state.draft = {
      clientX: clientX,
      clientY: clientY,
      sectionId: section.id,
      sectionLabel: section.label,
      scrollY: window.scrollY,
      pinX: clientX / docWidth,
      pinY: (window.scrollY + clientY) / docHeight
    };

    state.activeCommentId = null;
    renderAll();
  }

  function closeDraft() {
    state.draft = null;
    renderAll();
  }

  function togglePanel() {
    state.panelOpen = !state.panelOpen;
    renderAll();
  }

  function toggleAddMode() {
    state.addMode = !state.addMode;
    if (!state.addMode) closeDraft();
    renderAll();
  }

  function focusComment(commentId) {
    state.activeCommentId = commentId;
    state.draft = null;
    state.panelOpen = true;

    var comment = state.comments.find(function (c) { return c.id === commentId; });
    if (comment) {
      var docHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      var targetY = comment.pinY != null ? (comment.pinY * docHeight - 120) : comment.scrollY - 80;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }

    renderAll();
  }

  function upsertComment(comment) {
    var index = state.comments.findIndex(function (c) { return c.id === comment.id; });
    if (index === -1) state.comments.push(comment);
    else state.comments[index] = comment;
    state.comments.sort(function (a, b) {
      return a.createdAt.localeCompare(b.createdAt);
    });
  }

  function removeComment(commentId) {
    state.comments = state.comments.filter(function (c) { return c.id !== commentId; });
    if (state.activeCommentId === commentId) state.activeCommentId = null;
  }

  function connectEvents() {
    if (state.eventSource) {
      state.eventSource.close();
      state.eventSource = null;
    }

    var es = new EventSource('/api/sessions/' + encodeURIComponent(state.token) + '/events');
    state.eventSource = es;

    es.addEventListener('connected', function () {
      state.connected = true;
      renderBar();
    });

    es.addEventListener('comment_created', function (event) {
      var data = JSON.parse(event.data);
      upsertComment(data.comment);
      renderAll();
    });

    es.addEventListener('comment_updated', function (event) {
      var data = JSON.parse(event.data);
      upsertComment(data.comment);
      renderAll();
    });

    es.addEventListener('comment_deleted', function (event) {
      var data = JSON.parse(event.data);
      removeComment(data.commentId);
      renderAll();
    });

    es.onerror = function () {
      state.connected = false;
      renderBar();
    };
  }

  function loadComments() {
    return fetch('/api/sessions/' + encodeURIComponent(state.token) + '/comments')
      .then(function (res) {
        if (!res.ok) throw new Error('Could not load comments');
        return res.json();
      })
      .then(function (data) {
        state.comments = data.comments || [];
      });
  }

  function loadSession() {
    return fetch('/api/sessions/' + encodeURIComponent(state.token))
      .then(function (res) {
        if (!res.ok) throw new Error('Invalid or expired review link');
        return res.json();
      })
      .then(function (data) {
        state.session = data.session;
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
    renderPopover();

    var payload = {
      authorName: authorName,
      body: body,
      sectionId: state.draft.sectionId,
      sectionLabel: state.draft.sectionLabel,
      scrollY: state.draft.scrollY,
      pinX: state.draft.pinX,
      pinY: state.draft.pinY
    };

    fetch('/api/sessions/' + encodeURIComponent(state.token) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Failed to submit comment');
          return data;
        });
      })
      .then(function (data) {
        upsertComment(data.comment);
        state.draft = null;
        state.activeCommentId = data.comment.id;
        state.panelOpen = true;
        renderAll();
        showToast('Comment added at that spot — thank you!');
      })
      .catch(function (err) {
        showToast(err.message || 'Could not submit comment. Please try again.', true);
      })
      .finally(function () {
        state.submitting = false;
        renderPopover();
      });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.draft) closeDraft();
  });

  Promise.all([loadSession(), loadComments()])
    .then(function () {
      renderAll();
      connectEvents();
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

  window.addEventListener('resize', function () {
    renderPins();
    renderPendingPin();
    if (state.draft) renderPopover();
  });

  window.addEventListener('scroll', function () {
    renderPins();
    renderPendingPin();
  }, { passive: true });
})();
