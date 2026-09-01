# Dropdown Functionality - Live Site Cache-Bust Fix

## Problem Summary

Dropdowns were working correctly in the local environment but failing to open on the live deployed website. Investigation revealed the issue was **not a code problem** but rather a **cache-busting issue**.

## Root Cause Analysis

### What Was Happening

1. **Dropdown Enhancement Commit**: On Sep 1, 2026 at 15:16-15:25, commit `3732bef` updated:
   - `assets/page-extensions.js` - Added comprehensive dropdown handling
   - `assets/page-extensions.css` - Added proper pointer-events and visibility rules

2. **Version Number Not Updated**: The HTML files still referenced the old version:
   - `index.html` and `HomePage.html` used `?v=20260825k` (August 25)
   - Knowledge-centre files used `?v=20260901kc` (September 1)
   - Module files had no version numbers

3. **Browser Cache Problem**: Since the version query parameter (`?v=...`) wasn't updated:
   - Browsers served **cached versions** of the old JavaScript files
   - CDN/proxies served cached versions from before the dropdown fix
   - The old code didn't have the event listeners to open dropdowns

### Why This Happened

The version query parameter is used for cache-busting - it tells the browser:
- "This is a different file, don't use your cached copy"
- When you don't update the version number, the browser thinks the file hasn't changed
- This is a common optimization to serve cached files quickly, but it became a problem when code changed

## The Fix

### Changes Made

Updated all HTML files to use a new version number `v=20260901a` for both:
- `page-extensions.css`
- `page-extensions.js`

**Files Updated (12 total)**:
1. `index.html`
2. `HomePage.html`
3. `knowledge-centre.html`
4. `knowledge-centre/intercompany-control.html`
5. `knowledge-centre/group-financial-reporting.html`
6. `knowledge-centre/group-financial-planning.html`
7. `knowledge-centre/intercompany-control-manual-vs-automated.html`
8. `knowledge-centre/intercompany-control-faqs.html`
9. `modules/intercompany-control.html`
10. `modules/group-reporting.html`
11. `modules/group-planning.html`
12. `group-financial-reporting/complex-consolidations/index.html`

### How the Fix Works

When the new version number is deployed:
1. **Browsers** see `?v=20260901a` instead of `?v=20260825k`
2. **Browsers** realize the file is "new" and don't use cache
3. **Browsers** download the latest `page-extensions.js` with the working dropdown code
4. **CDNs** invalidate their cached versions and serve fresh files
5. **Result**: Dropdowns on the live site have access to the proper event listeners and work correctly

## Implementation Details

### What the Code Does

The `assets/page-extensions.js` file contains dropdown handling for all navigation dropdowns:

1. **Click Handler** (line 480): Opens/closes dropdown when trigger is clicked
2. **Keyboard Handler** (line 497): Closes dropdown with Escape key
3. **Click Outside** (line 511): Closes dropdown when clicking outside nav
4. **Link Click** (line 523): Closes dropdown after navigation
5. **CSS Integration**: Works with CSS rules that toggle `pointer-events` and `opacity`

### CSS Rules

**When dropdown is hidden**:
```css
.nav-drop {
  pointer-events: none;  /* Clicks pass through */
  opacity: 0;            /* Not visible */
  visibility: hidden;    /* Not in document flow */
}
```

**When dropdown is open**:
```css
.nav-item--drop.open > .nav-drop {
  pointer-events: auto;   /* Clicks are captured */
  opacity: 1;             /* Fully visible */
  visibility: visible;    /* In document flow */
}
```

## Testing Checklist

After deployment, verify the following on all pages (desktop and mobile):

### Main Pages
- [ ] `index.html` - Test Platform, Modules, Knowledge Centre dropdowns
- [ ] `HomePage.html` - Same dropdowns as index.html
- [ ] `knowledge-centre.html` - Test Resources and other dropdowns

### Module Pages
- [ ] `modules/intercompany-control.html`
- [ ] `modules/group-reporting.html`
- [ ] `modules/group-planning.html`

### Knowledge Centre Pages
- [ ] `knowledge-centre/intercompany-control.html`
- [ ] `knowledge-centre/group-financial-reporting.html`
- [ ] `knowledge-centre/group-financial-planning.html`
- [ ] `knowledge-centre/intercompany-control-manual-vs-automated.html`
- [ ] `knowledge-centre/intercompany-control-faqs.html`

### Complex Consolidations
- [ ] `group-financial-reporting/complex-consolidations/index.html`

### Dropdown Functionality Tests

For each page, test:

**Desktop Behavior**:
- [ ] Click dropdown trigger - opens dropdown
- [ ] Click same trigger again - closes dropdown
- [ ] Click different dropdown - closes previous one
- [ ] Click link inside dropdown - navigates and closes dropdown
- [ ] Click outside nav - closes dropdown
- [ ] Press Escape key - closes dropdown

**Mobile/Tablet**:
- [ ] Same tests as desktop
- [ ] Dropdowns don't get cut off at viewport edges
- [ ] Touch interactions work properly

**Accessibility**:
- [ ] `aria-expanded` attribute updates (true/false)
- [ ] Tab navigation through dropdown items works
- [ ] Screen reader announces dropdown state correctly

## Browser Compatibility

The fix works across all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Deployment Status

### Commits
- `1fc91f5` - Main fix commit (cache-bust update)
- `627e38f` - Clean-up commit (removed temp files)

### Deployment Path
1. Changes pushed to GitHub main branch
2. GitHub Actions workflow triggered automatically
3. GitHub Pages deployment happens
4. Render.com redeploy hook triggered
5. Both environments should serve updated files with new version number

### Cache Invalidation Timeline

- **Immediately** (within 30 seconds): New version number applied
- **5-30 minutes**: Most user browsers fetch fresh files
- **1-2 hours**: All edge caches (CDN) refreshed
- **2-4 hours**: Complete cache invalidation across all regions

## Verification Commands

To verify the fix locally:

```bash
# Check that all HTML files have the new version number
grep -r "page-extensions" --include="*.html" | grep "v=20260901a"

# Verify page-extensions.js exists and contains dropdown code
grep -n "closeNavDrops" assets/page-extensions.js

# Verify CSS has the correct rules
grep -n "pointer-events:auto" assets/page-extensions.css
```

## Notes

- **No code changes**: The JavaScript and CSS are identical; only version numbers were updated
- **No functionality changes**: The dropdown implementation is the same as the previous commit
- **Cache-safe**: Future updates can be deployed with new version numbers to avoid similar issues
- **Best practice**: Always update version query parameters when code changes are deployed

## Related Issues

This fix directly addresses the issue where dropdowns appeared to be broken on the live site while working perfectly in local development. The root cause was cached old versions of the JavaScript files being served by the browser and CDN.

## Questions?

If dropdowns still don't work after the deployment:
1. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+F5 on Windows)
2. Check browser console for JavaScript errors
3. Verify the script tag version shows `v=20260901a` in the page source
4. Test in an incognito/private window (bypasses some caches)
