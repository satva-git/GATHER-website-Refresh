/**
 * PageComment — standalone right-click comment overlay.
 * Covers the GATHER add-comment UX (create, pin, thread, edit, resolve,
 * replies, reactions, list panel) without review tokens, tabs, or GATHER APIs.
 */
(function (global) {
  'use strict';

  var COLORS = [
    { hex: '#5fa895', light: '#eef8f5', text: '#2f7d68' },
    { hex: '#6b9bd1', light: '#eef4fc', text: '#3f6fad' },
    { hex: '#9b8ad4', light: '#f4f1fb', text: '#6f5bb5' },
    { hex: '#d98ca6', light: '#fdf1f5', text: '#b15c7c' },
    { hex: '#d9a15b', light: '#fcf5ea', text: '#a8722c' },
    { hex: '#7fb08a', light: '#f0f8f1', text: '#4c8a5c' },
    { hex: '#dd8f80', light: '#fdf1ee', text: '#b15d4c' },
    { hex: '#8b9fd9', light: '#f1f3fc', text: '#5568b0' }
  ];
  var EMOJIS = ['👍', '❤️', '😂', '😮', '🎉'];

  var UI_SELECTOR = [
    '#pc-root', '#pc-popover', '#pc-thread-popover', '#pc-pending-pin',
    '.pc-pin', '.pc-context-menu', '.pc-tooltip', '.pc-toast', '.pc-fab',
    '#pc-dock', '#pc-panel', '.pc-overflow'
  ].join(',');

  var ICONS = {
    close: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    send: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12l16-8-6 16-2-6-8-2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    more: '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><circle cx="6" cy="2.2" r="1.2"/><circle cx="6" cy="6" r="1.2"/><circle cx="6" cy="9.8" r="1.2"/></svg>',
    check: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 7l3 3 6-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  var instance = null;

  function pageKeyFromLocation() {
    var page = String(location.pathname || '/').split('?')[0].split('#')[0];
    if (!page || page === '/') return '/index.html';
    return page;
  }

  function mergeComments(a, b) {
    var map = {};
    function ingest(list) {
      (list || []).forEach(function (comment) {
        if (!comment || !comment.id) return;
        var prev = map[comment.id];
        if (!prev) { map[comment.id] = comment; return; }
        if ((comment.replies || []).length > (prev.replies || []).length) map[comment.id] = comment;
      });
    }
    ingest(a);
    ingest(b);
    return Object.keys(map).map(function (id) { return map[id]; });
  }

  function defaults(options) {
    options = options || {};
    return {
      root: options.root || document.documentElement,
      storageKey: options.storageKey || 'page-comment:' + location.pathname,
      authorKey: options.authorKey || 'page-comment-author',
      apiUrl: options.apiUrl || '',
      pageKey: options.pageKey || pageKeyFromLocation(),
      enabled: options.enabled !== false,
      showMobileFab: options.showMobileFab !== false,
      onChange: typeof options.onChange === 'function' ? options.onChange : null
    };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function cssEscape(value) {
    if (global.CSS && typeof CSS.escape === 'function') return CSS.escape(value);
    return String(value).replace(/([^a-zA-Z0-9_-])/g, '\\$1');
  }

  function genId() {
    return 'pc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function docHeight() {
    return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  }

  function isUiTarget(target) {
    return !!(target && target.closest && target.closest(UI_SELECTOR));
  }

  function isEditableTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest('input, textarea, select, [contenteditable="true"]');
  }

  function PageCommentApp(options) {
    this.opt = defaults(options);
    this.root = this.opt.root.nodeType ? this.opt.root : document.querySelector(this.opt.root) || document.documentElement;
    this.comments = [];
    this.draft = null;
    this.contextMenu = null;
    this.activeId = null;
    this.editingId = null;
    this.toastTimer = null;
    this.draftPos = null;
    this.threadPos = null;
    this.tapMode = false;
    this.allPinsVisible = true;
    this.panelOpen = false;
    this.panelFilter = 'all';
    this.panelSearch = '';
    this.bound = [];
    this.pinLayer = null;
    this.unloadBound = false;
    this.syncing = false;
    this.draftKey = this.opt.storageKey + ':draft';
    this.replyKey = this.opt.storageKey + ':replies';

    this.load();
    this.mount();
    this.bind();
    this.render();
    this.openDeepLink();
    if (this.opt.apiUrl) this.syncFromServer();
  }

  PageCommentApp.prototype.mount = function () {
    var existing = document.getElementById('pc-root');
    if (existing) existing.remove();
    var root = document.createElement('div');
    root.id = 'pc-root';
    document.body.appendChild(root);

    var layer = document.createElement('div');
    layer.className = 'pc-pin-layer';
    layer.id = 'pc-pin-layer';
    document.body.appendChild(layer);
    this.pinLayer = layer;
    this.syncPinLayerSize();

    if (this.opt.showMobileFab) {
      var fab = document.createElement('button');
      fab.type = 'button';
      fab.className = 'pc-fab pc-interactive';
      fab.textContent = '+ Comment';
      fab.id = 'pc-fab';
      document.body.appendChild(fab);
    }
  };

  PageCommentApp.prototype.syncPinLayerSize = function () {
    if (this.pinLayer) this.pinLayer.style.height = docHeight() + 'px';
  };

  PageCommentApp.prototype.bindFn = function (el, type, fn, capture) {
    el.addEventListener(type, fn, capture);
    this.bound.push({ el: el, type: type, fn: fn, capture: capture });
  };

  PageCommentApp.prototype.bind = function () {
    var self = this;
    this.bindFn(document, 'contextmenu', function (e) {
      if (!self.opt.enabled) return;
      if (isUiTarget(e.target) || isEditableTarget(e.target)) return;
      if (self.root !== document.documentElement && self.root !== document.body && !self.root.contains(e.target)) return;
      e.preventDefault();
      self.openContextMenu(e.clientX, e.clientY);
    });
    this.bindFn(document, 'click', function (e) {
      if (self.contextMenu && !e.target.closest('.pc-context-menu')) self.closeContextMenu();
      if (!e.target.closest('.pc-overflow') && !e.target.closest('[data-pc-more]')) self.closeOverflow();
    });
    this.bindFn(document, 'keydown', function (e) {
      if (e.key !== 'Escape') return;
      self.closeContextMenu();
      self.closeOverflow();
      if (self.draft) self.closeDraft(false);
      else if (self.activeId) self.closeThread();
      else if (self.panelOpen) { self.panelOpen = false; self.renderDock(); }
      if (self.tapMode) self.setTapMode(false);
    });
    this.bindFn(window, 'resize', function () { self.renderPins(); });
    this.bindFn(window, 'scroll', function () { self.renderPins(); }, true);
    this.bindFn(window, 'hashchange', function () { self.openDeepLink(); });

    var fab = document.getElementById('pc-fab');
    if (fab) this.bindFn(fab, 'click', function () { self.setTapMode(!self.tapMode); });

    this.bindFn(document, 'click', function (e) {
      if (!self.tapMode) return;
      if (isUiTarget(e.target)) return;
      e.preventDefault();
      self.setTapMode(false);
      self.openDraft(e.clientX, e.clientY);
    }, true);

    if (!this.unloadBound) {
      this.unloadBound = true;
      this.bindFn(window, 'beforeunload', function (e) {
        self.persistDraft();
        if (!self.draft || !(self.draft.body || '').length) return;
        e.preventDefault();
        e.returnValue = 'You have an unsaved comment draft.';
        return e.returnValue;
      });
    }
  };

  PageCommentApp.prototype.setTapMode = function (on) {
    this.tapMode = !!on;
    document.body.classList.toggle('pc-add-mode', this.tapMode);
    var fab = document.getElementById('pc-fab');
    if (fab) fab.textContent = this.tapMode ? 'Cancel' : '+ Comment';
    this.renderDock();
  };

  PageCommentApp.prototype.load = function () {
    try {
      var raw = localStorage.getItem(this.opt.storageKey);
      this.comments = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(this.comments)) this.comments = [];
    } catch (e) { this.comments = []; }
  };

  PageCommentApp.prototype.save = function (action, extra) {
    try { localStorage.setItem(this.opt.storageKey, JSON.stringify(this.comments)); } catch (e) {}
    if (this.opt.onChange) this.opt.onChange(this.comments.slice());
    this.persistToServer(action, extra);
  };

  PageCommentApp.prototype.persistToServer = function (action, extra) {
    var self = this;
    if (!this.opt.apiUrl) return;
    var payload = { page: this.opt.pageKey, action: action || 'upsert', comments: this.comments };
    if (action === 'delete' && extra && extra.id) payload.id = extra.id;
    fetch(this.opt.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('save failed');
      return res.json();
    }).then(function (data) {
      if (!data || !Array.isArray(data.comments)) return;
      self.comments = mergeComments(data.comments, self.comments);
      try { localStorage.setItem(self.opt.storageKey, JSON.stringify(self.comments)); } catch (e) {}
      self.renderPins();
      self.renderDock();
    }).catch(function () {});
  };

  PageCommentApp.prototype.syncFromServer = function () {
    var self = this;
    if (!this.opt.apiUrl || this.syncing) return;
    this.syncing = true;
    var localCopy = this.comments.slice();
    fetch(this.opt.apiUrl + (this.opt.apiUrl.indexOf('?') >= 0 ? '&' : '?') + 'page=' + encodeURIComponent(this.opt.pageKey), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (!res.ok) throw new Error('load failed');
      return res.json();
    }).then(function (data) {
      var remote = data && Array.isArray(data.comments) ? data.comments : [];
      var merged = mergeComments(remote, localCopy);
      self.comments = merged;
      try { localStorage.setItem(self.opt.storageKey, JSON.stringify(merged)); } catch (e) {}
      self.render();
      var remoteIds = {};
      remote.forEach(function (c) { if (c && c.id) remoteIds[c.id] = true; });
      if (merged.some(function (c) { return c && c.id && !remoteIds[c.id]; })) self.persistToServer('upsert');
    }).catch(function () {
      self.comments = localCopy;
    }).then(function () { self.syncing = false; });
  };

  PageCommentApp.prototype.getName = function () {
    try { return localStorage.getItem(this.opt.authorKey) || ''; } catch (e) { return ''; }
  };
  PageCommentApp.prototype.setName = function (name) {
    try { localStorage.setItem(this.opt.authorKey, name); } catch (e) {}
  };

  PageCommentApp.prototype.loadDraft = function () {
    try { return JSON.parse(localStorage.getItem(this.draftKey) || 'null'); } catch (e) { return null; }
  };
  PageCommentApp.prototype.persistDraft = function () {
    if (!this.draft) return;
    try { localStorage.setItem(this.draftKey, JSON.stringify(this.draft)); } catch (e) {}
  };
  PageCommentApp.prototype.clearDraftStore = function () {
    try { localStorage.removeItem(this.draftKey); } catch (e) {}
  };
  PageCommentApp.prototype.loadReplyDrafts = function () {
    try { return JSON.parse(localStorage.getItem(this.replyKey) || '{}'); } catch (e) { return {}; }
  };
  PageCommentApp.prototype.saveReplyDraft = function (id, text) {
    var all = this.loadReplyDrafts();
    if (text) all[id] = text; else delete all[id];
    try { localStorage.setItem(this.replyKey, JSON.stringify(all)); } catch (e) {}
  };

  PageCommentApp.prototype.nearestLabel = function (clientY) {
    var sections = document.querySelectorAll('section[id], [data-pc-section], h1, h2');
    var best = 'Page';
    var bestDist = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var el = sections[i];
      var rect = el.getBoundingClientRect();
      var dist = Math.abs(clientY - (rect.top + rect.height / 2));
      if (dist < bestDist) {
        bestDist = dist;
        best = (el.getAttribute('data-pc-section') || el.id || (el.textContent || '').trim()).slice(0, 80) || 'Page';
      }
    }
    return best;
  };

  PageCommentApp.prototype.ignorable = function (el) {
    if (!el || el.nodeType !== 1) return true;
    if (isUiTarget(el)) return true;
    var tag = el.tagName;
    return tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'BR' || tag === 'HR';
  };

  PageCommentApp.prototype.elementTextHint = function (el) {
    if (!el) return '';
    var text = el.alt || (el.getAttribute && el.getAttribute('aria-label')) || (el.textContent || '');
    return String(text).replace(/\s+/g, ' ').trim().slice(0, 120);
  };

  PageCommentApp.prototype.resolveTarget = function (clientX, clientY) {
    var stack = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [document.elementFromPoint(clientX, clientY)];
    var start = null;
    for (var i = 0; i < stack.length; i++) {
      if (!this.ignorable(stack[i])) { start = stack[i]; break; }
    }
    if (!start) return null;
    var el = start;
    var fallback = start;
    while (el && el !== document.body && el !== document.documentElement) {
      if (!this.ignorable(el)) {
        fallback = el;
        if (el.id || (el.matches && el.matches('h1,h2,h3,h4,img,button,a,section,article,li,p'))) return el;
      }
      el = el.parentElement;
    }
    return fallback;
  };

  PageCommentApp.prototype.buildSelector = function (el) {
    if (!el || el.nodeType !== 1) return null;
    if (el.id) {
      var idSel = '#' + cssEscape(el.id);
      try { if (document.querySelectorAll(idSel).length === 1) return idSel; } catch (e) {}
    }
    var parts = [];
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) { parts.unshift('#' + cssEscape(cur.id)); break; }
      var tag = cur.tagName.toLowerCase();
      var parent = cur.parentElement;
      if (!parent) { parts.unshift(tag); break; }
      var same = Array.prototype.filter.call(parent.children, function (child) { return child.tagName === cur.tagName; });
      parts.unshift(same.length === 1 ? tag : tag + ':nth-of-type(' + (same.indexOf(cur) + 1) + ')');
      cur = parent;
      if (parts.length > 8) break;
    }
    return parts.join(' > ') || null;
  };

  PageCommentApp.prototype.ensureAnchorId = function (el) {
    var existing = el.getAttribute('data-pc-anchor');
    if (existing) return existing;
    var id = 'pc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    try { el.setAttribute('data-pc-anchor', id); } catch (e) {}
    return id;
  };

  PageCommentApp.prototype.createAnchor = function (clientX, clientY) {
    var el = this.resolveTarget(clientX, clientY);
    if (!el) return null;
    var rect = el.getBoundingClientRect();
    return {
      dataPcAnchor: this.ensureAnchorId(el),
      selector: this.buildSelector(el),
      elementId: el.id || null,
      textHint: this.elementTextHint(el),
      offsetX: Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1))),
      offsetY: Math.min(1, Math.max(0, (clientY - rect.top) / Math.max(rect.height, 1)))
    };
  };

  PageCommentApp.prototype.findByTextHint = function (anchor) {
    if (!anchor || !anchor.textHint || anchor.textHint.length < 3) return null;
    var hint = anchor.textHint.toLowerCase();
    var nodes = document.querySelectorAll('h1,h2,h3,h4,p,li,button,a,label,img,span,div');
    for (var i = 0; i < nodes.length; i++) {
      if (this.ignorable(nodes[i])) continue;
      var text = this.elementTextHint(nodes[i]).toLowerCase();
      if (text === hint) return nodes[i];
    }
    return null;
  };

  PageCommentApp.prototype.resolveAnchor = function (anchor) {
    if (!anchor) return null;
    if (anchor.dataPcAnchor) {
      var byData = document.querySelector('[data-pc-anchor="' + String(anchor.dataPcAnchor).replace(/"/g, '\\"') + '"]');
      if (byData) return byData;
    }
    if (anchor.elementId) {
      var byId = document.getElementById(anchor.elementId);
      if (byId) return byId;
    }
    if (anchor.selector) {
      try {
        var bySel = document.querySelector(anchor.selector);
        if (bySel) return bySel;
      } catch (e) {}
    }
    return this.findByTextHint(anchor);
  };

  PageCommentApp.prototype.pinPosition = function (comment) {
    var el = this.resolveAnchor(comment.anchor);
    if (el && comment.anchor) {
      var rect = el.getBoundingClientRect();
      var ox = typeof comment.anchor.offsetX === 'number' ? comment.anchor.offsetX : 0.5;
      var oy = typeof comment.anchor.offsetY === 'number' ? comment.anchor.offsetY : 0.15;
      var clientX = rect.left + rect.width * ox;
      var clientY = rect.top + rect.height * oy;
      return { leftPx: window.scrollX + clientX, topPx: window.scrollY + clientY, clientX: clientX, clientY: clientY };
    }
    if (comment.pinX != null && comment.pinY != null) {
      return {
        leftPx: comment.pinX * document.documentElement.clientWidth,
        topPx: comment.pinY * docHeight(),
        clientX: comment.pinX * document.documentElement.clientWidth - window.scrollX,
        clientY: comment.pinY * docHeight() - window.scrollY
      };
    }
    return null;
  };

  PageCommentApp.prototype.spreadPins = function (entries) {
    var MIN = 38;
    var clusters = {};
    entries.forEach(function (entry, idx) {
      var key = Math.round(entry.pos.leftPx / 24) + ':' + Math.round(entry.pos.topPx / 24);
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(idx);
    });
    Object.keys(clusters).forEach(function (key) {
      var idxs = clusters[key];
      if (idxs.length < 2) return;
      idxs.forEach(function (entryIdx, i) {
        var col = i % 4;
        var row = Math.floor(i / 4);
        entries[entryIdx].pos.leftPx += (col - Math.min(idxs.length - 1, 3) / 2) * MIN;
        entries[entryIdx].pos.topPx += row * (MIN - 6);
      });
    });
    return entries;
  };

  PageCommentApp.prototype.openContextMenu = function (x, y) {
    this.closeContextMenu();
    this.closeDraft(false);
    this.closeThread();
    var menu = document.createElement('div');
    menu.className = 'pc-context-menu pc-interactive';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.innerHTML =
      '<button type="button" class="pc-context-item" id="pc-add-comment">' +
        '<span class="pc-context-icon">+</span> Add comment here' +
      '</button>';
    document.body.appendChild(menu);
    this.contextMenu = menu;
    var rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) menu.style.left = (x - rect.width) + 'px';
    if (rect.bottom > window.innerHeight - 8) menu.style.top = (y - rect.height) + 'px';
    var self = this;
    menu.querySelector('#pc-add-comment').addEventListener('click', function () {
      self.closeContextMenu();
      self.openDraft(x, y);
    });
  };

  PageCommentApp.prototype.closeContextMenu = function () {
    if (this.contextMenu) { this.contextMenu.remove(); this.contextMenu = null; }
  };

  PageCommentApp.prototype.openDraft = function (clientX, clientY) {
    var saved = this.loadDraft();
    var height = docHeight();
    this.draft = {
      clientX: clientX,
      clientY: clientY,
      label: this.nearestLabel(clientY),
      pinX: clientX / document.documentElement.clientWidth,
      pinY: (window.scrollY + clientY) / height,
      anchor: this.createAnchor(clientX, clientY),
      author: (saved && saved.author) || this.getName(),
      body: (saved && saved.body) || ''
    };
    this.activeId = null;
    this.render();
    if (saved && saved.body) this.toast('Restored your unsaved draft.');
  };

  PageCommentApp.prototype.closeDraft = function (discard) {
    if (discard) this.clearDraftStore();
    else this.persistDraft();
    var el = document.getElementById('pc-popover');
    if (el) el.remove();
    this.draft = null;
    this.draftPos = null;
    this.renderPending();
  };

  PageCommentApp.prototype.closeThread = function () {
    this.closeOverflow();
    var el = document.getElementById('pc-thread-popover');
    if (el) el.remove();
    this.activeId = null;
    this.editingId = null;
    this.threadPos = null;
    this.renderPins();
  };

  PageCommentApp.prototype.clamp = function (left, top, width, height) {
    var m = 8;
    return {
      left: Math.min(Math.max(left, m), Math.max(m, window.innerWidth - width - m)),
      top: Math.min(Math.max(top, m), Math.max(m, window.innerHeight - height - m))
    };
  };

  PageCommentApp.prototype.positionPopover = function (popover, saved, clientX, clientY) {
    var rect = popover.getBoundingClientRect();
    var width = rect.width || 280;
    var height = rect.height || 220;
    var pos;
    if (saved) pos = this.clamp(saved.left, saved.top, width, height);
    else {
      var left = clientX + 16;
      var top = clientY + 16;
      if (left + width > window.innerWidth - 12) left = clientX - width - 16;
      pos = this.clamp(left, top, width, height);
    }
    popover.style.left = pos.left + 'px';
    popover.style.top = pos.top + 'px';
    return pos;
  };

  PageCommentApp.prototype.makeDraggable = function (popover, handle, onChange) {
    var self = this;
    handle.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      var startX = e.clientX, startY = e.clientY;
      var rect = popover.getBoundingClientRect();
      var startLeft = rect.left, startTop = rect.top;
      popover.classList.add('pc-dragging');
      function move(ev) {
        var pos = self.clamp(startLeft + ev.clientX - startX, startTop + ev.clientY - startY, popover.offsetWidth, popover.offsetHeight);
        popover.style.left = pos.left + 'px';
        popover.style.top = pos.top + 'px';
      }
      function up() {
        popover.classList.remove('pc-dragging');
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        if (onChange) onChange({ left: popover.getBoundingClientRect().left, top: popover.getBoundingClientRect().top });
      }
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      e.preventDefault();
    });
  };

  PageCommentApp.prototype.renderDraft = function () {
    var existing = document.getElementById('pc-popover');
    if (existing) existing.remove();
    if (!this.draft) return;
    var name = this.draft.author || this.getName();
    var hasName = !!(name && name.trim());
    var pop = document.createElement('div');
    pop.id = 'pc-popover';
    pop.className = 'pc-popover pc-interactive';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Add comment');
    pop.innerHTML =
      '<div class="pc-popover-head" title="Drag to move">' +
        '<div class="pc-composer-title"><strong>Comment</strong><span class="pc-composer-meta">' + escapeHtml(this.draft.label) + '</span></div>' +
        '<button type="button" class="pc-icon-btn" id="pc-draft-close" aria-label="Close">' + ICONS.close + '</button>' +
      '</div>' +
      '<form id="pc-draft-form" class="pc-composer-form">' +
        (hasName
          ? '<input type="hidden" name="author" value="' + escapeHtml(name) + '">' +
            '<button type="button" class="pc-composer-byline" id="pc-edit-author">Commenting as <strong>' + escapeHtml(name) + '</strong></button>'
          : '<label class="pc-composer-name"><span class="pc-sr-only">Your name</span>' +
            '<input name="author" type="text" required maxlength="80" placeholder="Your name" value="' + escapeHtml(name) + '"></label>') +
        '<div class="pc-composer-box">' +
          '<textarea name="body" required maxlength="4000" rows="3" placeholder="Add a comment…">' + escapeHtml(this.draft.body || '') + '</textarea>' +
          '<button type="submit" class="pc-send-btn" aria-label="Post comment">' + ICONS.send + '</button>' +
        '</div>' +
        '<div class="pc-composer-hint">Drafts auto-save · Ctrl+Enter to post</div>' +
      '</form>';
    document.body.appendChild(pop);
    this.draftPos = this.positionPopover(pop, this.draftPos, this.draft.clientX, this.draft.clientY);
    this.makeDraggable(pop, pop.querySelector('.pc-popover-head'), function (pos) { this.draftPos = pos; }.bind(this));
    var self = this;
    pop.querySelector('#pc-draft-close').addEventListener('click', function () {
      self.closeDraft(false);
      if (self.loadDraft() && self.loadDraft().body) self.toast('Draft saved in this browser.');
    });
    var form = pop.querySelector('#pc-draft-form');
    form.addEventListener('submit', function (e) { e.preventDefault(); self.submitDraft(e.target); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
    var body = form.querySelector('textarea[name="body"]');
    var author = form.querySelector('input[name="author"]');
    function sync() {
      if (!self.draft) return;
      if (author) self.draft.author = author.value;
      self.draft.body = body.value;
      self.persistDraft();
    }
    body.addEventListener('input', sync);
    if (author) author.addEventListener('input', sync);
    var edit = pop.querySelector('#pc-edit-author');
    if (edit) {
      edit.addEventListener('click', function () {
        var next = window.prompt('Your name for comments', self.getName() || '');
        if (next == null) return;
        next = String(next).trim();
        if (!next) { self.toast('Name cannot be empty.', true); return; }
        self.setName(next);
        self.draft.author = next;
        self.persistDraft();
        self.renderDraft();
      });
    }
    (hasName ? body : (author || body)).focus();
  };

  PageCommentApp.prototype.submitDraft = function (form) {
    var author = (form.author.value || '').trim();
    var body = form.body.value != null ? String(form.body.value) : '';
    if (!author || !String(body).replace(/\s+/g, '')) {
      this.toast('Please enter your name and comment.', true);
      return;
    }
    this.setName(author);
    var snapshot = this.draft;
    var comment = {
      id: genId(),
      authorName: author,
      body: body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'open',
      pinX: snapshot.pinX,
      pinY: snapshot.pinY,
      anchor: snapshot.anchor,
      label: snapshot.label,
      replies: [],
      reactions: {}
    };
    this.comments.push(comment);
    this.save('upsert');
    this.clearDraftStore();
    this.closeDraft(true);
    this.render();
    this.toast('Comment added.');
    this.openThread(comment, snapshot.clientX, snapshot.clientY);
  };

  PageCommentApp.prototype.relativeTime = function (iso) {
    var diff = Date.now() - new Date(iso).getTime();
    var mins = Math.round(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hours = Math.round(mins / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.round(hours / 24) + 'd ago';
  };

  PageCommentApp.prototype.commentById = function (id) {
    return this.comments.filter(function (c) { return c.id === id; })[0] || null;
  };

  PageCommentApp.prototype.closeOverflow = function () {
    var menu = document.getElementById('pc-overflow');
    if (menu) menu.remove();
  };

  PageCommentApp.prototype.copyLink = function (id) {
    var link = location.origin + location.pathname + location.search + '#comment-' + id;
    var done = function () { this.toast('Link copied.'); }.bind(this);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done).catch(done);
    } else {
      done();
    }
  };

  PageCommentApp.prototype.openDeepLink = function () {
    var hash = location.hash || '';
    if (hash.indexOf('#comment-') !== 0) return;
    var comment = this.commentById(hash.slice(9));
    if (!comment) return;
    var pos = this.pinPosition(comment) || { clientX: 80, clientY: 80 };
    this.openThread(comment, pos.clientX, pos.clientY);
  };

  PageCommentApp.prototype.openThread = function (comment, clientX, clientY) {
    this.closeDraft(false);
    this.closeContextMenu();
    this.closeOverflow();
    var existing = document.getElementById('pc-thread-popover');
    if (existing) existing.remove();
    this.activeId = comment.id;
    var index = this.comments.indexOf(comment);
    var color = COLORS[(index >= 0 ? index : 0) % COLORS.length];
    var num = index + 1;
    var resolved = comment.status === 'resolved';
    var isMine = comment.authorName === this.getName();
    var editing = this.editingId === comment.id;
    var savedReply = this.loadReplyDrafts()[comment.id] || '';

    var replies = (comment.replies || []).map(function (reply) {
      return (
        '<div class="pc-reply"><div class="pc-reply-top"><span class="pc-reply-author">' + escapeHtml(reply.authorName) +
        '</span><span>' + escapeHtml(this.relativeTime(reply.createdAt)) + '</span></div>' +
        '<div class="pc-reply-body">' + escapeHtml(reply.body) + '</div></div>'
      );
    }, this).join('') || '<div class="pc-thread-empty">No replies yet.</div>';

    var reactions = EMOJIS.map(function (emoji) {
      var count = (comment.reactions && comment.reactions[emoji]) || 0;
      return '<button type="button" class="pc-react' + (count ? ' active' : '') + '" data-emoji="' + emoji + '">' +
        emoji + (count ? ' ' + count : '') + '</button>';
    }).join('');

    var bodyHtml = editing
      ? '<form class="pc-edit-form" id="pc-edit-form"><textarea name="body" required maxlength="4000">' + escapeHtml(comment.body) + '</textarea>' +
        '<div class="pc-edit-actions"><button type="button" class="pc-btn" id="pc-edit-cancel">Cancel</button>' +
        '<button type="submit" class="pc-btn pc-btn-primary">Save</button></div></form>'
      : '<div class="pc-thread-meta"><span class="pc-thread-author">' + escapeHtml(comment.authorName) +
        (isMine ? '<span class="pc-you">You</span>' : '') + '</span>' +
        '<span>' + escapeHtml(this.relativeTime(comment.createdAt)) + '</span></div>' +
        '<div class="pc-thread-comment">' + escapeHtml(comment.body) + '</div>' +
        (isMine ? '<button type="button" class="pc-delete-link" id="pc-edit-comment">Edit</button>' : '') +
        '<div class="pc-reactions">' + reactions + '</div>';

    var pop = document.createElement('div');
    pop.id = 'pc-thread-popover';
    pop.className = 'pc-popover pc-interactive';
    pop.style.setProperty('--pc-accent', color.hex);
    pop.style.setProperty('--pc-accent-light', color.light);
    pop.style.setProperty('--pc-accent-text', color.text);
    pop.innerHTML =
      '<div class="pc-popover-head pc-popover-head--tinted" title="Drag to move">' +
        '<div class="pc-popover-head-id"><div class="pc-popover-head-title"><strong>Comment</strong></div>' +
        '<span class="pc-popover-num">#' + num + (resolved ? ' · Resolved' : '') + '</span></div>' +
        '<div class="pc-head-actions">' +
          '<button type="button" class="pc-icon-btn" data-pc-more aria-label="More">' + ICONS.more + '</button>' +
          '<button type="button" class="pc-icon-btn' + (resolved ? ' is-resolved' : '') + '" id="pc-resolve" aria-label="' + (resolved ? 'Reopen' : 'Resolve') + '">' + ICONS.check + '</button>' +
          '<button type="button" class="pc-icon-btn" id="pc-thread-close" aria-label="Close">' + ICONS.close + '</button>' +
        '</div></div>' +
      '<div class="pc-thread-body">' + bodyHtml +
        '<div class="pc-replies">' + replies + '</div>' +
        '<form id="pc-reply-form" class="pc-composer-form" style="padding:10px 0 0">' +
          '<div class="pc-composer-box"><textarea name="body" required maxlength="4000" rows="2" placeholder="Reply…">' + escapeHtml(savedReply) + '</textarea>' +
          '<button type="submit" class="pc-send-btn" aria-label="Post reply">' + ICONS.send + '</button></div></form>' +
        '<div class="pc-thread-actions"><button type="button" class="pc-delete-link" id="pc-delete">Delete</button></div>' +
      '</div>';
    document.body.appendChild(pop);
    this.threadPos = this.positionPopover(pop, this.threadPos, clientX, clientY);
    this.makeDraggable(pop, pop.querySelector('.pc-popover-head'), function (pos) { this.threadPos = pos; }.bind(this));

    var self = this;
    pop.querySelector('#pc-thread-close').addEventListener('click', function () { self.closeThread(); });
    pop.querySelector('#pc-resolve').addEventListener('click', function () {
      comment.status = resolved ? 'open' : 'resolved';
      self.save('upsert');
      self.openThread(comment, clientX, clientY);
    });
    pop.querySelector('[data-pc-more]').addEventListener('click', function (e) {
      e.stopPropagation();
      self.closeOverflow();
      var menu = document.createElement('div');
      menu.id = 'pc-overflow';
      menu.className = 'pc-overflow pc-interactive';
      menu.innerHTML =
        '<button type="button" class="pc-overflow-item" data-action="copy">Copy link</button>' +
        '<button type="button" class="pc-overflow-item" data-action="edit">Edit</button>' +
        '<button type="button" class="pc-overflow-item pc-overflow-item--danger" data-action="delete">Delete</button>';
      document.body.appendChild(menu);
      var r = e.currentTarget.getBoundingClientRect();
      menu.style.top = (r.bottom + 4) + 'px';
      menu.style.left = Math.max(8, r.right - 160) + 'px';
      menu.addEventListener('click', function (ev) {
        var action = ev.target.getAttribute('data-action');
        self.closeOverflow();
        if (action === 'copy') self.copyLink(comment.id);
        if (action === 'edit') { self.editingId = comment.id; self.openThread(comment, clientX, clientY); }
        if (action === 'delete') pop.querySelector('#pc-delete').click();
      });
    });
    var editBtn = pop.querySelector('#pc-edit-comment');
    if (editBtn) editBtn.addEventListener('click', function () {
      self.editingId = comment.id;
      self.openThread(comment, clientX, clientY);
    });
    var editForm = pop.querySelector('#pc-edit-form');
    if (editForm) {
      pop.querySelector('#pc-edit-cancel').addEventListener('click', function () {
        self.editingId = null;
        self.openThread(comment, clientX, clientY);
      });
      editForm.addEventListener('submit', function (e) {
        e.preventDefault();
        comment.body = editForm.body.value;
        comment.updatedAt = new Date().toISOString();
        self.editingId = null;
        self.save('upsert');
        self.openThread(comment, clientX, clientY);
        self.toast('Comment updated.');
      });
    }
    pop.querySelectorAll('.pc-react').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var emoji = btn.getAttribute('data-emoji');
        comment.reactions = comment.reactions || {};
        comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
        self.save('upsert');
        self.openThread(comment, clientX, clientY);
      });
    });
    pop.querySelector('#pc-delete').addEventListener('click', function () {
      if (!window.confirm('Delete this comment?')) return;
      self.comments = self.comments.filter(function (c) { return c.id !== comment.id; });
      self.save('delete', { id: comment.id });
      self.closeThread();
      self.render();
      self.toast('Comment deleted.');
    });
    var replyForm = pop.querySelector('#pc-reply-form');
    var replyBody = replyForm.querySelector('textarea');
    replyBody.addEventListener('input', function () { self.saveReplyDraft(comment.id, replyBody.value); });
    replyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = (replyBody.value || '').trim();
      if (!text) return;
      comment.replies = comment.replies || [];
      comment.replies.push({
        id: genId(),
        authorName: self.getName() || 'Guest',
        body: text,
        createdAt: new Date().toISOString()
      });
      self.saveReplyDraft(comment.id, '');
      self.save('upsert');
      self.openThread(comment, clientX, clientY);
    });
    this.renderPins();
    this.renderDock();
  };

  PageCommentApp.prototype.filteredComments = function () {
    var q = (this.panelSearch || '').toLowerCase();
    return this.comments.filter(function (c) {
      if (this.panelFilter === 'open' && c.status === 'resolved') return false;
      if (this.panelFilter === 'resolved' && c.status !== 'resolved') return false;
      if (!q) return true;
      return (c.body || '').toLowerCase().indexOf(q) !== -1 || (c.authorName || '').toLowerCase().indexOf(q) !== -1;
    }, this);
  };

  PageCommentApp.prototype.renderDock = function () {
    var existing = document.getElementById('pc-dock');
    if (existing) existing.remove();
    var openCount = this.comments.filter(function (c) { return c.status !== 'resolved'; }).length;
    var dock = document.createElement('div');
    dock.id = 'pc-dock';
    dock.className = 'pc-dock pc-interactive';
    dock.innerHTML =
      '<button type="button" class="pc-dock-btn' + (this.panelOpen ? ' active' : '') + '" id="pc-open-panel">Comments (' + openCount + ')</button>' +
      (this.comments.length ? '<button type="button" class="pc-dock-btn" id="pc-toggle-pins">' + (this.allPinsVisible ? 'Hide pins' : 'Show pins') + '</button>' : '') +
      '<button type="button" class="pc-dock-btn' + (this.tapMode ? ' active' : '') + '" id="pc-dock-add">+ Add</button>';
    document.body.appendChild(dock);
    var self = this;
    dock.querySelector('#pc-open-panel').addEventListener('click', function () {
      self.panelOpen = !self.panelOpen;
      self.renderDock();
    });
    var vis = dock.querySelector('#pc-toggle-pins');
    if (vis) vis.addEventListener('click', function () {
      self.allPinsVisible = !self.allPinsVisible;
      self.renderPins();
      self.renderDock();
    });
    dock.querySelector('#pc-dock-add').addEventListener('click', function () { self.setTapMode(!self.tapMode); });
    this.renderPanel();
  };

  PageCommentApp.prototype.renderPanel = function () {
    var existing = document.getElementById('pc-panel');
    if (existing) existing.remove();
    if (!this.panelOpen) return;
    var self = this;
    var items = this.filteredComments();
    var panel = document.createElement('aside');
    panel.id = 'pc-panel';
    panel.className = 'pc-panel pc-interactive';
    panel.innerHTML =
      '<div class="pc-panel-head"><strong>Comments</strong>' +
      '<button type="button" class="pc-icon-btn" id="pc-panel-close">' + ICONS.close + '</button></div>' +
      '<input class="pc-panel-search" id="pc-panel-search" placeholder="Search comments" value="' + escapeHtml(this.panelSearch) + '">' +
      '<div class="pc-panel-filters">' +
        '<button type="button" class="pc-chip' + (this.panelFilter === 'all' ? ' active' : '') + '" data-filter="all">All</button>' +
        '<button type="button" class="pc-chip' + (this.panelFilter === 'open' ? ' active' : '') + '" data-filter="open">Open</button>' +
        '<button type="button" class="pc-chip' + (this.panelFilter === 'resolved' ? ' active' : '') + '" data-filter="resolved">Resolved</button>' +
      '</div><div class="pc-panel-list" id="pc-panel-list"></div>';
    document.body.appendChild(panel);
    panel.querySelector('#pc-panel-close').addEventListener('click', function () { self.panelOpen = false; self.renderDock(); });
    panel.querySelector('#pc-panel-search').addEventListener('input', function (e) {
      self.panelSearch = e.target.value;
      self.renderPanel();
      var input = document.getElementById('pc-panel-search');
      if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    });
    panel.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () { self.panelFilter = btn.getAttribute('data-filter'); self.renderPanel(); });
    });
    var list = panel.querySelector('#pc-panel-list');
    if (!this.comments.length) {
      list.innerHTML = '<div class="pc-thread-empty">No comments yet. Right-click anywhere to add one.</div>';
      return;
    }
    if (!items.length) {
      list.innerHTML = '<div class="pc-thread-empty">No matching comments.</div>';
      return;
    }
    items.forEach(function (comment) {
      var idx = self.comments.indexOf(comment);
      var color = COLORS[idx % COLORS.length];
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'pc-card';
      card.style.setProperty('--pc-accent-text', color.text);
      card.innerHTML = '<div class="pc-card-top"><span class="pc-card-num">#' + (idx + 1) + ' ' + escapeHtml(comment.authorName) +
        '</span><span>' + escapeHtml(comment.status === 'resolved' ? 'Resolved' : 'Open') + '</span></div>' +
        '<div class="pc-card-body">' + escapeHtml(comment.body) + '</div>';
      card.addEventListener('click', function () {
        var pos = self.pinPosition(comment) || { clientX: 80, clientY: 80 };
        self.openThread(comment, pos.clientX, pos.clientY);
      });
      list.appendChild(card);
    });
  };

  PageCommentApp.prototype.renderPins = function () {
    this.syncPinLayerSize();
    this.pinLayer.innerHTML = '';
    if (!this.allPinsVisible) return;
    var self = this;
    var entries = [];
    this.comments.forEach(function (comment, index) {
      var pos = self.pinPosition(comment);
      if (!pos) return;
      entries.push({ comment: comment, pos: pos, index: index });
    });
    this.spreadPins(entries);
    entries.forEach(function (entry) {
      var comment = entry.comment;
      var pos = entry.pos;
      var color = COLORS[entry.index % COLORS.length];
      var pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'pc-pin' + (comment.id === self.activeId ? ' active' : '') + (comment.status === 'resolved' ? ' resolved' : '');
      pin.style.top = pos.topPx + 'px';
      pin.style.left = pos.leftPx + 'px';
      pin.style.backgroundColor = color.hex;
      pin.textContent = String(entry.index + 1);
      pin.setAttribute('aria-label', 'Comment #' + (entry.index + 1) + ' by ' + comment.authorName);
      pin.addEventListener('mouseenter', function (e) { self.showTooltip(comment, e.clientX, e.clientY); });
      pin.addEventListener('mouseleave', function () { self.hideTooltip(); });
      pin.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        self.hideTooltip();
        self.openThread(comment, e.clientX, e.clientY);
      });
      self.pinLayer.appendChild(pin);
    });
  };

  PageCommentApp.prototype.renderPending = function () {
    var existing = document.getElementById('pc-pending-pin');
    if (existing) existing.remove();
    if (!this.draft) return;
    var pos = this.pinPosition({ anchor: this.draft.anchor, pinX: this.draft.pinX, pinY: this.draft.pinY });
    if (!pos) pos = { topPx: this.draft.pinY * docHeight(), leftPx: this.draft.pinX * document.documentElement.clientWidth };
    var marker = document.createElement('div');
    marker.id = 'pc-pending-pin';
    marker.className = 'pc-pending-pin';
    marker.style.top = pos.topPx + 'px';
    marker.style.left = pos.leftPx + 'px';
    document.body.appendChild(marker);
  };

  PageCommentApp.prototype.showTooltip = function (comment, x, y) {
    this.hideTooltip();
    var tip = document.createElement('div');
    tip.className = 'pc-tooltip';
    tip.id = 'pc-tooltip';
    tip.innerHTML = '<strong>' + escapeHtml(comment.authorName) + '</strong><div>' + escapeHtml((comment.body || '').slice(0, 140)) + '</div>';
    document.body.appendChild(tip);
    var rect = tip.getBoundingClientRect();
    var left = x + 14;
    var top = y - rect.height - 10;
    if (left + rect.width > window.innerWidth - 12) left = x - rect.width - 14;
    if (top < 12) top = y + 14;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  };

  PageCommentApp.prototype.hideTooltip = function () {
    var tip = document.getElementById('pc-tooltip');
    if (tip) tip.remove();
  };

  PageCommentApp.prototype.toast = function (message, isError) {
    var existing = document.getElementById('pc-toast');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 'pc-toast';
    el.className = 'pc-toast' + (isError ? ' error' : '');
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () { el.remove(); }, 2400);
  };

  PageCommentApp.prototype.render = function () {
    this.renderPins();
    this.renderPending();
    this.renderDraft();
    this.renderDock();
  };

  PageCommentApp.prototype.destroy = function () {
    this.bound.forEach(function (b) { b.el.removeEventListener(b.type, b.fn, b.capture); });
    this.bound = [];
    ['pc-root', 'pc-pin-layer', 'pc-popover', 'pc-thread-popover', 'pc-pending-pin', 'pc-tooltip', 'pc-toast', 'pc-fab', 'pc-dock', 'pc-panel', 'pc-overflow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    document.querySelectorAll('.pc-context-menu').forEach(function (el) { el.remove(); });
    document.body.classList.remove('pc-add-mode');
  };

  var api = {
    init: function (options) {
      if (instance) instance.destroy();
      instance = new PageCommentApp(options);
      return api;
    },
    destroy: function () {
      if (instance) instance.destroy();
      instance = null;
    },
    getComments: function () {
      return instance ? instance.comments.slice() : [];
    }
  };

  global.PageComment = api;
  if (document.currentScript && document.currentScript.hasAttribute('data-auto-init')) {
    var start = function () { api.init(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(window);
