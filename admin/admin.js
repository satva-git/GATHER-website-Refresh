(function () {
  'use strict';

  var state = {
    sessions: [],
    selectedToken: null,
    comments: [],
    filter: 'all',
    connected: false,
    eventSource: null
  };

  var sessionsList = document.getElementById('sessions-list');
  var commentsList = document.getElementById('comments-list');
  var commentsTitle = document.getElementById('comments-title');
  var commentsSubtitle = document.getElementById('comments-subtitle');
  var liveStatus = document.getElementById('live-status');
  var createDialog = document.getElementById('create-dialog');
  var createForm = document.getElementById('create-form');
  var toast = document.getElementById('toast');

  var toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
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

  function shareUrl(session) {
    return window.location.origin + session.pagePath + '?review=' + session.token;
  }

  function filteredComments() {
    if (state.filter === 'open') {
      return state.comments.filter(function (c) { return c.status === 'open'; });
    }
    if (state.filter === 'resolved') {
      return state.comments.filter(function (c) { return c.status === 'resolved'; });
    }
    return state.comments;
  }

  function renderSessions() {
    if (!state.sessions.length) {
      sessionsList.innerHTML =
        '<div class="empty-state">No share links yet. Create one to send to your client.</div>';
      return;
    }

    sessionsList.innerHTML = state.sessions.map(function (session) {
      var active = session.token === state.selectedToken ? ' active' : '';
      var url = shareUrl(session);
      return (
        '<article class="session-card' + active + '" data-token="' + session.token + '">' +
          '<div class="session-title">' + escapeHtml(session.title) + '</div>' +
          '<div class="session-meta">Created ' + escapeHtml(formatTime(session.createdAt)) + '</div>' +
          '<div class="share-row">' +
            '<input class="share-input" type="text" readonly value="' + escapeHtml(url) + '">' +
            '<button type="button" class="btn btn-ghost copy-btn" data-url="' + escapeHtml(url) + '">Copy</button>' +
          '</div>' +
          '<div class="count-row">' +
            '<span class="chip">' + (session.openCount || 0) + ' open</span>' +
            '<span class="chip chip-muted">' + (session.commentCount || 0) + ' total</span>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    sessionsList.querySelectorAll('.session-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.copy-btn')) return;
        selectSession(card.dataset.token);
      });
    });

    sessionsList.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        copyText(btn.dataset.url);
      });
    });
  }

  function renderComments() {
    var session = state.sessions.find(function (s) { return s.token === state.selectedToken; });

    if (!session) {
      commentsTitle.textContent = 'Comments';
      commentsSubtitle.textContent = 'Select a share link to view feedback.';
      commentsList.innerHTML =
        '<div class="empty-state">Select a share link on the left to view client comments.</div>';
      return;
    }

    commentsTitle.textContent = session.title;
    commentsSubtitle.textContent = 'Live feedback for this share link';

    var comments = filteredComments();
    if (!comments.length) {
      commentsList.innerHTML =
        '<div class="empty-state">No comments in this view yet.</div>';
      return;
    }

    commentsList.innerHTML = comments.slice().reverse().map(function (comment) {
      var resolved = comment.status === 'resolved';
      var previewUrl = shareUrl(session) + '#comment-' + comment.id;
      return (
        '<article class="comment-item' + (resolved ? ' resolved' : '') + '">' +
          '<div class="comment-top">' +
            '<span class="comment-author">' + escapeHtml(comment.authorName) + '</span>' +
            '<span class="status-badge status-' + (resolved ? 'resolved' : 'open') + '">' +
              (resolved ? 'Resolved' : 'Open') +
            '</span>' +
          '</div>' +
          (comment.sectionLabel || comment.sectionId ?
            '<div class="comment-section">' + escapeHtml(comment.sectionLabel || comment.sectionId) + '</div>' : '') +
          '<div class="comment-body">' + escapeHtml(comment.body) + '</div>' +
          '<div class="comment-meta">' + escapeHtml(formatTime(comment.createdAt)) +
            (comment.pinX != null ? ' · pinned on page' : '') +
          '</div>' +
          '<div class="comment-actions">' +
            '<button type="button" class="btn btn-ghost toggle-btn" data-id="' + comment.id + '" data-status="' +
              (resolved ? 'open' : 'resolved') + '">' +
              (resolved ? 'Reopen' : 'Mark resolved') +
            '</button>' +
            '<a class="btn btn-ghost" href="' + escapeHtml(previewUrl) + '" target="_blank" rel="noopener">Open on page</a>' +
            '<button type="button" class="btn btn-danger delete-btn" data-id="' + comment.id + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    commentsList.querySelectorAll('.toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        updateCommentStatus(btn.dataset.id, btn.dataset.status);
      });
    });

    commentsList.querySelectorAll('.delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (confirm('Delete this comment permanently?')) {
          deleteComment(btn.dataset.id);
        }
      });
    });
  }

  function renderAll() {
    renderSessions();
    renderComments();
    liveStatus.classList.toggle('offline', !state.connected);
    liveStatus.innerHTML =
      '<span class="live-dot"></span> ' + (state.connected ? 'Live' : 'Reconnecting');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Share link copied to clipboard');
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast('Share link copied to clipboard');
    } catch (e) {
      showToast('Could not copy link');
    }
    input.remove();
  }

  function loadSessions() {
    return fetch('/api/sessions')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.sessions = data.sessions || [];
      });
  }

  function loadComments(token) {
    return fetch('/api/sessions/' + encodeURIComponent(token) + '/comments')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.comments = data.comments || [];
      });
  }

  function selectSession(token) {
    state.selectedToken = token;
    loadComments(token).then(renderAll);
  }

  function refreshSessionCounts() {
    return loadSessions().then(function () {
      if (state.selectedToken) {
        return loadComments(state.selectedToken);
      }
    });
  }

  function createSession(formData) {
    return fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        pagePath: formData.get('pagePath') || '/'
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || 'Failed to create session');
          return data;
        });
      })
      .then(function (data) {
        return refreshSessionCounts().then(function () {
          state.selectedToken = data.session.token;
          renderAll();
          copyText(data.shareUrl);
          showToast('Share link created and copied');
        });
      });
  }

  function updateCommentStatus(commentId, status) {
    fetch('/api/comments/' + encodeURIComponent(commentId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Update failed');
        return refreshSessionCounts();
      })
      .then(renderAll)
      .catch(function () {
        showToast('Could not update comment');
      });
  }

  function deleteComment(commentId) {
    fetch('/api/comments/' + encodeURIComponent(commentId), { method: 'DELETE' })
      .then(function (res) {
        if (!res.ok) throw new Error('Delete failed');
        return refreshSessionCounts();
      })
      .then(renderAll)
      .catch(function () {
        showToast('Could not delete comment');
      });
  }

  function connectEvents() {
    if (state.eventSource) state.eventSource.close();

    var es = new EventSource('/api/admin/events');
    state.eventSource = es;

    es.addEventListener('connected', function () {
      state.connected = true;
      renderAll();
    });

    es.addEventListener('session_created', function () {
      refreshSessionCounts().then(renderAll);
    });

    es.addEventListener('comment_created', function () {
      refreshSessionCounts().then(renderAll);
    });

    es.addEventListener('comment_updated', function () {
      refreshSessionCounts().then(renderAll);
    });

    es.addEventListener('comment_deleted', function () {
      refreshSessionCounts().then(renderAll);
    });

    es.onerror = function () {
      state.connected = false;
      renderAll();
    };
  }

  document.getElementById('create-session-btn').addEventListener('click', function () {
    createDialog.showModal();
  });

  document.getElementById('cancel-create').addEventListener('click', function () {
    createDialog.close();
  });

  createForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var formData = new FormData(createForm);
    createSession(formData)
      .then(function () {
        createForm.reset();
        createForm.pagePath.value = '/';
        createDialog.close();
      })
      .catch(function () {
        showToast('Could not create share link');
      });
  });

  document.querySelectorAll('.filter-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.filter-tab').forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      state.filter = tab.dataset.filter;
      renderComments();
    });
  });

  loadSessions()
    .then(function () {
      if (state.sessions.length) {
        state.selectedToken = state.sessions[0].token;
        return loadComments(state.selectedToken);
      }
    })
    .then(function () {
      renderAll();
      connectEvents();
    });
})();
