(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  if (params.get('review')) return;

  var STORAGE_PREFIX = 'gather-page-comments:';
  var UI_SELECTOR = [
    '#pc-root',
    '.pc-popover',
    '.pc-context-menu',
    '.pc-tooltip',
    '.pc-marker',
    '.pc-pending-pin',
    '.pc-badge'
  ].join(',');

  var state = {
    comments: [],
    draft: null,
    activeId: null,
    contextMenu: null,
    tooltipCommentId: null
  };

  var root = document.createElement('div');
  root.id = 'pc-root';
  root.className = 'pc-root';
  document.body.appendChild(root);

  var markerLayer = document.createElement('div');
  markerLayer.className = 'pc-marker-layer';
  markerLayer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(markerLayer);

  var tooltip = document.createElement('div');
  tooltip.className = 'pc-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  root.appendChild(tooltip);

  var toastEl = document.createElement('div');
  toastEl.className = 'pc-toast';
  toastEl.setAttribute('role', 'status');
  root.appendChild(toastEl);

  var toastTimer = null;

  function storageKey() {
    return STORAGE_PREFIX + window.location.pathname;
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

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2800);
  }

  function isUiTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(UI_SELECTOR);
  }

  function docHeight() {
    return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  }

  function loadComments() {
    try {
      var raw = localStorage.getItem(storageKey());
      state.comments = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(state.comments)) state.comments = [];
    } catch (e) {
      state.comments = [];
    }
  }

  function saveComments() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state.comments));
    } catch (e) {
      showToast('Could not save comments to local storage.');
    }
  }

  function generateId() {
    return 'pc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function clampPopoverPosition(clientX, clientY, heightEstimate) {
    var width = Math.min(340, window.innerWidth - 24);
    var height = heightEstimate || 280;
    var left = clientX + 12;
    var top = clientY + 12;

    if (left + width > window.innerWidth - 12) left = clientX - width - 12;
    if (left < 12) left = 12;
    if (top + height > window.innerHeight - 12) top = clientY - height - 12;
    if (top < 12) top = 12;

    return { left: left, top: top };
  }

  function closeContextMenu() {
    if (state.contextMenu) {
      state.contextMenu.remove();
      state.contextMenu = null;
    }
  }

  function closePopover() {
    var existing = document.querySelector('.pc-popover');
    if (existing) existing.remove();
    var pending = document.getElementById('pc-pending-pin');
    if (pending) pending.remove();
    state.draft = null;
  }

  function hideTooltip() {
    state.tooltipCommentId = null;
    tooltip.classList.remove('visible');
  }

  function showTooltip(comment, clientX, clientY) {
    state.tooltipCommentId = comment.id;
    var preview = comment.body.length > 120 ? comment.body.slice(0, 120) + '…' : comment.body;
    tooltip.innerHTML =
      escapeHtml(preview) +
      '<span class="pc-tooltip-meta">' + escapeHtml(formatTime(comment.createdAt)) + '</span>';

    tooltip.style.left = '0';
    tooltip.style.top = '0';
    tooltip.classList.add('visible');

    var rect = tooltip.getBoundingClientRect();
    var left = clientX + 14;
    var top = clientY - rect.height - 10;

    if (left + rect.width > window.innerWidth - 12) {
      left = clientX - rect.width - 14;
    }
    if (left < 12) left = 12;
    if (top < 12) top = clientY + 14;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function renderBadge() {
    var existing = document.getElementById('pc-badge');
    if (existing) existing.remove();
    if (!state.comments.length) return;

    var badge = document.createElement('div');
    badge.id = 'pc-badge';
    badge.className = 'pc-badge pc-interactive';
    badge.innerHTML =
      '<span class="pc-badge-count">' + state.comments.length + '</span>' +
      '<span>Page comment' + (state.comments.length === 1 ? '' : 's') + '</span>';
    badge.title = 'Right-click anywhere to add a comment';
    root.appendChild(badge);
  }

  function renderMarkers() {
    markerLayer.innerHTML = '';
    var height = docHeight();
    var index = 0;

    state.comments.forEach(function (comment) {
      if (comment.pinX == null || comment.pinY == null) return;
      index += 1;

      var marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'pc-marker' + (comment.id === state.activeId ? ' active' : '');
      marker.style.top = (comment.pinY * height) + 'px';
      marker.style.left = (comment.pinX * 100) + 'vw';
      marker.textContent = String(index);
      marker.setAttribute('aria-label', 'Comment ' + index);

      marker.addEventListener('mouseenter', function (e) {
        showTooltip(comment, e.clientX, e.clientY);
      });
      marker.addEventListener('mousemove', function (e) {
        if (state.tooltipCommentId === comment.id) {
          showTooltip(comment, e.clientX, e.clientY);
        }
      });
      marker.addEventListener('mouseleave', hideTooltip);
      marker.addEventListener('click', function (e) {
        e.stopPropagation();
        openViewPopover(comment, e.clientX, e.clientY);
      });

      markerLayer.appendChild(marker);
    });
  }

  function renderPendingPin() {
    var existing = document.getElementById('pc-pending-pin');
    if (existing) existing.remove();
    if (!state.draft) return;

    var pin = document.createElement('div');
    pin.id = 'pc-pending-pin';
    pin.className = 'pc-pending-pin';
    pin.style.top = (state.draft.pinY * docHeight()) + 'px';
    pin.style.left = (state.draft.pinX * 100) + 'vw';
    pin.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pin);
  }

  function openContextMenu(clientX, clientY) {
    closeContextMenu();
    closePopover();
    hideTooltip();

    var menu = document.createElement('div');
    menu.className = 'pc-context-menu pc-interactive';
    menu.style.left = clientX + 'px';
    menu.style.top = clientY + 'px';
    menu.innerHTML =
      '<button type="button" class="pc-context-item" id="pc-add-comment">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
          '<path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '</svg>' +
        'Add comment here' +
      '</button>';

    document.body.appendChild(menu);
    state.contextMenu = menu;

    var rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) {
      menu.style.left = (clientX - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight - 8) {
      menu.style.top = (clientY - rect.height) + 'px';
    }

    menu.querySelector('#pc-add-comment').addEventListener('click', function () {
      closeContextMenu();
      openDraftPopover(clientX, clientY);
    });
  }

  function openDraftPopover(clientX, clientY) {
    closePopover();
    state.activeId = null;

    var width = document.documentElement.clientWidth;
    var height = docHeight();

    state.draft = {
      clientX: clientX,
      clientY: clientY,
      pinX: clientX / width,
      pinY: (window.scrollY + clientY) / height
    };

    renderPendingPin();

    var pos = clampPopoverPosition(clientX, clientY);
    var popover = document.createElement('div');
    popover.className = 'pc-popover pc-interactive';
    popover.style.left = pos.left + 'px';
    popover.style.top = pos.top + 'px';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'Add comment');

    popover.innerHTML =
      '<div class="pc-popover-head">' +
        '<div><strong>Add comment</strong><span>Right-click saved locally</span></div>' +
        '<button type="button" class="pc-popover-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<form class="pc-popover-body">' +
        '<label class="pc-field">' +
          '<span>Comment</span>' +
          '<textarea name="body" required maxlength="2000" placeholder="What should change here?"></textarea>' +
        '</label>' +
        '<div class="pc-popover-actions">' +
          '<button type="button" class="pc-btn pc-btn-ghost pc-cancel">Cancel</button>' +
          '<button type="submit" class="pc-btn pc-btn-primary">Save</button>' +
        '</div>' +
      '</form>';

    document.body.appendChild(popover);

    popover.querySelector('.pc-popover-close').addEventListener('click', closePopover);
    popover.querySelector('.pc-cancel').addEventListener('click', closePopover);
    popover.querySelector('form').addEventListener('submit', onSubmitDraft);
    popover.querySelector('textarea').focus();
  }

  function openViewPopover(comment, clientX, clientY) {
    closePopover();
    closeContextMenu();
    hideTooltip();
    state.activeId = comment.id;
    renderMarkers();

    var pos = clampPopoverPosition(clientX, clientY, 220);
    var popover = document.createElement('div');
    popover.className = 'pc-popover pc-interactive';
    popover.style.left = pos.left + 'px';
    popover.style.top = pos.top + 'px';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'View comment');

    popover.innerHTML =
      '<div class="pc-popover-head">' +
        '<div><strong>Comment</strong><span>Saved on this page</span></div>' +
        '<button type="button" class="pc-popover-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="pc-popover-body">' +
        '<div class="pc-view-body">' + escapeHtml(comment.body) + '</div>' +
        '<div class="pc-view-time">' + escapeHtml(formatTime(comment.createdAt)) + '</div>' +
        '<div class="pc-popover-actions">' +
          '<button type="button" class="pc-btn pc-btn-danger pc-delete">Delete</button>' +
          '<button type="button" class="pc-btn pc-btn-ghost pc-close">Close</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(popover);

    popover.querySelector('.pc-popover-close').addEventListener('click', function () {
      state.activeId = null;
      closePopover();
      renderMarkers();
    });
    popover.querySelector('.pc-close').addEventListener('click', function () {
      state.activeId = null;
      closePopover();
      renderMarkers();
    });
    popover.querySelector('.pc-delete').addEventListener('click', function () {
      deleteComment(comment.id);
    });
  }

  function onSubmitDraft(e) {
    e.preventDefault();
    if (!state.draft) return;

    var body = e.target.body.value.trim();
    if (!body) {
      showToast('Please enter a comment.');
      return;
    }

    var comment = {
      id: generateId(),
      body: body,
      pinX: state.draft.pinX,
      pinY: state.draft.pinY,
      createdAt: new Date().toISOString()
    };

    state.comments.push(comment);
    state.comments.sort(function (a, b) {
      return a.createdAt.localeCompare(b.createdAt);
    });

    saveComments();
    state.activeId = comment.id;
    closePopover();
    renderAll();
    showToast('Comment saved.');
  }

  function deleteComment(commentId) {
    var marker = markerLayer.querySelector('.pc-marker.active');
    if (marker) marker.classList.add('removing');

    setTimeout(function () {
      state.comments = state.comments.filter(function (c) { return c.id !== commentId; });
      if (state.activeId === commentId) state.activeId = null;
      saveComments();
      closePopover();
      renderAll();
      showToast('Comment deleted.');
    }, marker ? 180 : 0);
  }

  function renderAll() {
    renderMarkers();
    renderPendingPin();
    renderBadge();
  }

  document.addEventListener('contextmenu', function (e) {
    if (isUiTarget(e.target)) return;

    e.preventDefault();
    openContextMenu(e.clientX, e.clientY);
  });

  document.addEventListener('click', function (e) {
    if (state.contextMenu && !e.target.closest('.pc-context-menu')) {
      closeContextMenu();
    }
    if (!e.target.closest('.pc-popover') && !e.target.closest('.pc-marker') && !state.draft) {
      if (state.activeId && !e.target.closest('.pc-popover')) {
        state.activeId = null;
        renderMarkers();
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeContextMenu();
      if (state.draft || document.querySelector('.pc-popover')) {
        state.activeId = null;
        closePopover();
        renderMarkers();
      }
    }
  });

  window.addEventListener('resize', function () {
    renderMarkers();
    renderPendingPin();
  });

  window.addEventListener('scroll', function () {
    renderMarkers();
    renderPendingPin();
    hideTooltip();
  }, { passive: true });

  loadComments();
  renderAll();
})();
