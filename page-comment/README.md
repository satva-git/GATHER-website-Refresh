# PageComment (right-click comments)

Standalone overlay extracted from this site’s review UI. It is **not** wired into GATHER pages, the review server, or `?review=` tokens.

## Add to another project

Copy the `page-comment` folder, then on any page:

```html
<link rel="stylesheet" href="page-comment/page-comment.css">
<script src="page-comment/page-comment.js"></script>
<script>
  PageComment.init();
</script>
```

Or auto-start:

```html
<script src="page-comment/page-comment.js" data-auto-init></script>
```

Open `demo.html` in a browser to try it with no other site code.

Covered:
- Right-click → Add comment here (pins + composer)
- Tap-to-place (`+ Add` / mobile FAB)
- Draft auto-save / restore, Ctrl+Enter, change name
- Color pins, hover tooltip, overlap spread, hide/show pins
- Thread: reply, edit, resolve/reopen, emoji reactions, copy link, delete
- Comments panel with search + Open/Resolved filter
- `#comment-id` deep links
- Optional `apiUrl` for server persist (off by default)

Not copied (GATHER-only): `?review=` tokens, live SSE sync, journey/pillars tab IDs, @mentions of GATHER teammates, session owner/admin UI.

## Options

```js
PageComment.init({
  root: document.querySelector('#main'), // limit right-click to this element
  storageKey: 'my-site-comments',
  authorKey: 'my-site-comment-author',
  showMobileFab: true,
  onChange: function (comments) { /* optional */ }
});

PageComment.getComments();
PageComment.destroy();
```

No extra npm packages are required.
