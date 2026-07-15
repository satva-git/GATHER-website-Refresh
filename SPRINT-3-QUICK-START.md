# Sprint 3 Quick Start Guide
## Collaboration & Enterprise Features (32 hours → 9.7+/10)

### Overview
This sprint adds the remaining 6 features to reach enterprise-grade collaboration. Build on the solid foundation from Sprints 1 & 2.

**Current Score**: 8.8/10  
**Target Score**: 9.7+/10  
**Remaining Features**: 6  
**Estimated Hours**: 32-40  

---

## Feature Breakdown

### 3.1 @Mentions & Autocomplete (6-8 hours)
**What users will do:**
- Type `@` in reply textarea
- See dropdown list of team members
- Click or press Enter to insert mention
- Mentioned users get notification

**Implementation steps:**
1. Add team member data structure
2. Listen for `@` in textarea input
3. Build autocomplete dropdown
4. Insert mention with formatting
5. Add styling for @mention highlights

**Files to modify:**
- `review.js` - Mention detection logic
- `review.css` - Dropdown styling + mention highlights

**Backend requirement:**
- GET `/api/team-members` - List of available team members
- POST notification to mentioned users

**Code template:**
```javascript
function showMentionDropdown(matches, textarea) {
  const dropdown = document.createElement('div');
  dropdown.className = 'rv-mention-dropdown';
  dropdown.innerHTML = matches.map(m => 
    `<button class="rv-mention-item" onclick="insertMention('${m.name}')">@${m.name}</button>`
  ).join('');
  textarea.parentElement.appendChild(dropdown);
}

function insertMention(name, textareaId) {
  const textarea = document.getElementById(textareaId);
  const text = textarea.value;
  const lastAt = text.lastIndexOf('@');
  textarea.value = text.slice(0, lastAt) + `@${name} `;
}
```

---

### 3.2 Reply Threading (8-10 hours)
**What users will do:**
- Reply to specific comment in thread
- See nested "In reply to..." context
- Collapse/expand reply threads
- View full conversation

**Implementation steps:**
1. Update comment data structure (add parentCommentId)
2. Build nested HTML rendering
3. Add indentation via CSS
4. Implement collapse/expand toggle
5. Update search/filter for threads

**Files to modify:**
- `review.js` - Thread rendering, nesting logic
- `review.css` - Indentation, nesting styles

**Data structure:**
```javascript
{
  id: 'reply-abc',
  parentCommentId: 'comment-123',  // NEW: parent reference
  body: 'This is a reply',
  authorName: 'Diana',
  createdAt: '...',
  replies: []  // Can have nested replies
}
```

**CSS for nesting:**
```css
.rv-comment-reply {
  margin-left: 2rem;
  padding-left: 1rem;
  border-left: 2px solid var(--rv-line);
}

.rv-comment-depth-1 { margin-left: 1rem; }
.rv-comment-depth-2 { margin-left: 2rem; }
.rv-comment-depth-3 { margin-left: 3rem; }
```

---

### 3.3 Edit History (6-8 hours)
**What users will do:**
- Click "edited X minutes ago" on comment
- See timeline of edits
- View before/after text comparison
- Know who changed what and when

**Implementation steps:**
1. Store edit history in comment data
2. Track editor, timestamp, previous text
3. Build timeline UI in modal
4. Add diff highlighting (before/after)
5. Show edit history button on thread

**Files to modify:**
- `review.js` - History tracking, modal rendering
- `review.css` - Timeline styling

**Backend requirement:**
- GET `/api/comments/:id/history` - Edit history timeline
- POST `/api/comments/:id` needs to track edit

**Data structure:**
```javascript
{
  commentId: 'comment-123',
  history: [
    {
      editedAt: '2026-07-15T16:30:00Z',
      editorName: 'Dixit',
      previousText: 'old text',
      newText: 'new text'
    },
    { ... }
  ]
}
```

**Code template:**
```javascript
async function showEditHistory(commentId) {
  const res = await fetch(`/api/comments/${commentId}/history`);
  const history = await res.json();
  
  const modal = document.getElementById('edit-history-modal');
  modal.innerHTML = history.map(entry => `
    <div class="history-entry">
      <time>${formatTime(entry.editedAt)}</time>
      <strong>${entry.editorName}</strong>
      <div class="diff">
        <p class="before"><del>${entry.previousText}</del></p>
        <p class="after"><ins>${entry.newText}</ins></p>
      </div>
    </div>
  `).join('');
  
  modal.style.display = 'block';
}
```

---

### 3.4 Deep Linking (4-5 hours)
**What users will do:**
- Click link icon on comment
- Get `example.com/page#comment-123` URL
- Share via chat, email, etc.
- Link recipient auto-scrolls to comment

**Implementation steps:**
1. Generate comment ID if missing
2. Add link button to comment header
3. Copy URL to clipboard
4. Parse URL hash on page load
5. Auto-scroll to comment with highlight

**Files to modify:**
- `review.js` - URL generation, hash parsing, scroll logic
- `review.css` - Link button styling, highlight effect

**Code template:**
```javascript
function generateCommentLink(commentId) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#comment-${commentId}`;
}

function copyCommentLink(commentId) {
  const link = generateCommentLink(commentId);
  navigator.clipboard.writeText(link);
  showToast('Link copied to clipboard!');
}

// On page load:
window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (hash.startsWith('#comment-')) {
    const commentId = hash.split('-')[1];
    openComment(commentId);
    highlightComment(commentId);
  }
});

function highlightComment(commentId) {
  const card = document.querySelector(`[data-id="${commentId}"]`);
  card.classList.add('highlighted');
  setTimeout(() => card.classList.remove('highlighted'), 3000);
}
```

**CSS for highlight:**
```css
@keyframes rv-highlight {
  0% { background: rgba(95, 212, 164, 0.3); }
  100% { background: transparent; }
}

.rv-card.highlighted {
  animation: rv-highlight 3s ease-out;
}
```

---

### 3.5 Emoji Reactions (5-6 hours)
**What users will do:**
- Hover over comment, click emoji icon
- Choose reaction (👍 ❤️ 😂 😮 😢 🎉 ✨ 🚀)
- See reaction counts
- Remove reaction by clicking again

**Implementation steps:**
1. Add reactions data to comments
2. Build emoji picker UI
3. Handle toggle reactions (add/remove)
4. Track who reacted (optional)
5. Display reaction counts

**Files to modify:**
- `review.js` - Reaction logic, emoji picker
- `review.css` - Reaction display styling

**Data structure:**
```javascript
{
  commentId: 'comment-123',
  reactions: {
    '👍': ['Dixit', 'Diana'],      // User names who reacted
    '❤️': ['Josh'],
    '😂': ['Diana', 'Diana'],      // Can react multiple times
  }
  // OR simple count version:
  reactions: { '👍': 2, '❤️': 1, '😂': 2 }
}
```

**Code template:**
```javascript
const EMOJI_SET = ['👍', '❤️', '😂', '😮', '😢', '🎉', '✨', '🚀'];

function showEmojiPicker(commentId) {
  const picker = document.createElement('div');
  picker.className = 'rv-emoji-picker';
  picker.innerHTML = EMOJI_SET.map(emoji => 
    `<button onclick="toggleReaction(${commentId}, '${emoji}')">${emoji}</button>`
  ).join('');
  document.body.appendChild(picker);
}

async function toggleReaction(commentId, emoji) {
  await fetch(`/api/comments/${commentId}/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji })
  });
  location.reload();  // Or better: update state locally
}
```

**CSS for reactions:**
```css
.rv-comment-reactions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.rv-reaction {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 0.5px solid var(--rv-line);
  border-radius: 16px;
  background: transparent;
  cursor: pointer;
}

.rv-reaction:hover {
  background: var(--rv-surface-1);
}

.rv-emoji-picker {
  position: fixed;
  background: var(--rv-paper);
  border: 1px solid var(--rv-line);
  border-radius: 8px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  z-index: 1000;
}
```

---

### 3.6 Pinned Comments & Bulk Actions (6-7 hours)
**What users will do:**
- Click pin icon to pin critical comment
- See ⚠️ Critical badge on pin
- Pinned comments appear at top
- "Mark all resolved" button for batch actions
- "Delete all" with confirmation

**Implementation steps:**
1. Add pinned flag to comments
2. Sort pinned to top in list
3. Add pin button and icon
4. Build bulk action buttons
5. Add confirmation dialogs

**Files to modify:**
- `review.js` - Pin logic, bulk actions, sorting
- `review.css` - Pin badge styling

**Data structure:**
```javascript
{
  id: 'comment-123',
  pinned: true,           // NEW
  priority: 'critical',   // 'critical', 'normal', null
  // ... rest of comment data
}
```

**Sorting logic:**
```javascript
function sortComments(comments) {
  return comments.sort((a, b) => {
    // Pinned first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then by creation date
    return b.createdAt.localeCompare(a.createdAt);
  });
}
```

**Bulk actions template:**
```javascript
async function markAllResolved() {
  if (!confirm('Mark all open comments as resolved?')) return;
  
  const openComments = state.comments.filter(c => c.status === 'open');
  await Promise.all(
    openComments.map(c =>
      fetch(`/api/comments/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      })
    )
  );
  
  showToast('All comments marked resolved');
  renderAll();
}

async function deleteAll() {
  if (!confirm('Delete all comments? This cannot be undone.')) return;
  
  const allComments = state.comments;
  await Promise.all(
    allComments.map(c =>
      fetch(`/api/comments/${c.id}`, { method: 'DELETE' })
    )
  );
  
  showToast('All comments deleted');
  renderAll();
}
```

**CSS for pinned:**
```css
.rv-comment.pinned {
  border-left: 4px solid #E24B4A;
  background: linear-gradient(90deg, rgba(226, 75, 74, 0.04), transparent);
}

.rv-priority-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #E24B4A;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.rv-pin-icon {
  cursor: pointer;
  transition: transform 0.2s;
}

.rv-pin-icon:hover {
  transform: scale(1.1);
}
```

---

## Implementation Order

### Priority 1: Quick Wins (Do First)
1. **3.4 Deep Linking** (4-5h) - Foundation for sharing
2. **3.5 Emoji Reactions** (5-6h) - High engagement, straightforward

### Priority 2: Core Collaboration
3. **3.1 @Mentions** (6-8h) - Team communication
4. **3.6 Pinned & Bulk** (6-7h) - Management features

### Priority 3: Advanced
5. **3.2 Reply Threading** (8-10h) - Most complex, highest value
6. **3.3 Edit History** (6-8h) - Requires backend coordination

---

## Development Checklist

### Setup (Hour 1)
- [ ] Review current code base
- [ ] Create feature branch: `feature/sprint-3-collaboration`
- [ ] Set up backend API endpoints (if needed)
- [ ] Create test data with all Sprint 3 features

### Testing (Per Feature)
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance <200ms

### Documentation
- [ ] Update ARIA labels
- [ ] Add code comments
- [ ] Document new data structures
- [ ] Create Sprint 3 completion guide

### Quality Assurance
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Performance profiling
- [ ] User testing (if available)

---

## Estimated Timeline

| Feature | Hours | Week |
|---------|-------|------|
| Deep Linking | 4-5 | 1 |
| Emoji Reactions | 5-6 | 1 |
| @Mentions | 6-8 | 2 |
| Pinned & Bulk | 6-7 | 2 |
| Reply Threading | 8-10 | 3 |
| Edit History | 6-8 | 3-4 |
| Testing & Polish | 4-5 | 4 |
| **Total** | **39-49** | **4 weeks** |

---

## Success Criteria

### Before Sprint 3
- [x] Sprints 1 & 2 complete
- [x] Score: 8.8/10
- [x] 0 console errors
- [x] Keyboard accessible

### After Sprint 3
- [ ] All 6 features implemented
- [ ] Score: 9.7+/10
- [ ] 0 accessibility violations
- [ ] Mobile tested
- [ ] Performance: <200ms
- [ ] Documentation complete

---

## Support & References

### Key Functions to Know
- `renderCommentCards()` - Display comments
- `renderPanel()` - Sidebar with filters
- `openThreadPopover()` - Detail view
- `apiJson()` - Make API calls
- `showToast()` - Notifications
- `escapeHtml()` - Security

### New Functions to Create
- `formatRelativeTime()` - Already done ✓
- `generateCommentLink()` - Deep linking
- `toggleReaction()` - Emoji reactions
- `showMentionDropdown()` - @mentions
- `showEditHistory()` - Edit history
- `togglePin()` - Pinned comments
- `renderThreadNested()` - Reply threading

### Backend APIs Needed
- `POST /api/comments/:id/reactions` - Add reaction
- `GET /api/comments/:id/history` - Edit history
- `GET /api/team-members` - For @mentions
- `POST /api/comments/:id/pin` - Pin comment
- `PATCH /api/comments/bulk` - Bulk operations

---

## Ready to Start! 🚀

Sprint 3 is well-planned and ready to execute. Start with Deep Linking and Emoji Reactions for quick wins, then build toward the more complex features.

**Questions?** Review IMPLEMENTATION-GUIDE.md or existing code comments.

**Let's build enterprise-grade comment UX! 💪**
