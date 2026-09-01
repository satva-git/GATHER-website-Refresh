# Dropdown Functionality Verification Checklist

## Pre-Verification Steps

1. **Wait for Deployment**: Allow 5-10 minutes for GitHub Actions to complete
2. **Clear Cache**: 
   - Hard refresh the live site (Ctrl+F5 on Windows/Linux, Cmd+Shift+R on Mac)
   - Or open in incognito/private window
3. **Check Version**: Open browser DevTools → Network tab → look for `page-extensions.js?v=20260901a`

## Test Sites

- **Live Site**: `https://satva-git.github.io/GATHER-website-Refresh/`
- **Render Instance**: Check your Render deployment URL

## Desktop Testing (Chrome/Edge/Firefox/Safari)

### Platform Dropdown (Main Navigation)

- [ ] Click "Platform" button
  - **Expected**: Dropdown opens with sub-items visible
  - **Visual**: Items appear below button with shadow
  - **Accessibility**: `aria-expanded` changes to "true"

- [ ] Click another dropdown (e.g., "Modules")
  - **Expected**: Platform dropdown closes
  - **Behavior**: Smooth transition

- [ ] Click "Platform" button again
  - **Expected**: Dropdown closes
  - **Visual**: Fade out animation

- [ ] Click link inside dropdown (e.g., "Process Consolidations")
  - **Expected**: Navigate to page AND dropdown closes

### Modules Dropdown

- [ ] Click "Modules" button → Dropdown opens
- [ ] Click different module link → Closes dropdown and navigates
- [ ] Tab to "Modules" button and press Enter → Opens dropdown

### Knowledge Centre Dropdown

- [ ] Click "Knowledge Centre" button → Dropdown opens
- [ ] Mega-menu displays with full width
- [ ] Click category link (e.g., "Group Financial Planning")
- [ ] Dropdown closes and navigation happens

### Resources Dropdown (if present)

- [ ] Click "Resources" button → Dropdown opens
- [ ] Smaller dropdown (not mega-menu)
- [ ] Click any resource link → Closes dropdown

### Close Behavior

- [ ] **Click outside navigation**: All dropdowns close
- [ ] **Press Escape key**: Currently open dropdown closes
- [ ] **Click body**: All dropdowns close

## Mobile Testing (iPhone/Android or DevTools mobile mode)

### Viewport Sizes to Test

- [ ] Mobile: 375px wide (iPhone SE)
- [ ] Mobile: 414px wide (iPhone 11)
- [ ] Tablet: 768px wide (iPad)
- [ ] Tablet: 1024px wide (iPad Pro)

### Mobile Dropdown Tests

- [ ] Click dropdown trigger → Opens properly
- [ ] No horizontal scroll appears
- [ ] Dropdown doesn't extend beyond screen
- [ ] Touch events properly recognized
- [ ] Can click dropdown links while scrolled

### Mobile Specific Checks

- [ ] Dropdown doesn't get cut off at top of viewport
- [ ] Dropdown doesn't extend beyond bottom when scrolled down
- [ ] Mega-menu maintains full width on all mobile sizes
- [ ] Resources dropdown aligns correctly on right side

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through navigation
- [ ] Tab into "Platform" button → Dropdown opens
- [ ] Tab through dropdown items (focus management)
- [ ] Shift+Tab back → Previous item gets focus
- [ ] Escape key → Dropdown closes, focus returns to button

### Screen Reader (NVDA, JAWS, VoiceOver)

- [ ] Button announces "aria-expanded=false" when closed
- [ ] Button announces "aria-expanded=true" when open
- [ ] Screen reader announces "menu" role correctly
- [ ] Can navigate links inside dropdown with arrow keys

### Visual Indicators

- [ ] Focus visible on trigger buttons
- [ ] Chevron icon rotates when dropdown opens
- [ ] Visual feedback for hover state
- [ ] Clear visual state change on open/close

## Cross-Browser Testing

| Browser | Version | Desktop | Mobile | Mega-Menu | Notes |
|---------|---------|---------|--------|-----------|-------|
| Chrome | Latest | [ ] | [ ] | [ ] | |
| Firefox | Latest | [ ] | [ ] | [ ] | |
| Safari | Latest | [ ] | [ ] | [ ] | |
| Edge | Latest | [ ] | [ ] | [ ] | |
| iOS Safari | Latest | [ ] | [ ] | [ ] | |
| Chrome Android | Latest | [ ] | [ ] | [ ] | |

## Network Inspection

1. **Open DevTools** → Network tab
2. **Reload page**
3. **Look for**:
   - [ ] `page-extensions.js?v=20260901a` → Status 200 (not 304)
   - [ ] `page-extensions.css?v=20260901a` → Status 200 (not 304)
   - [ ] Response headers show correct Content-Type
   - [ ] No 404 errors for dropdown-related files

4. **Check Request Headers**:
   - [ ] Verify cache headers are respected
   - [ ] Content loaded from network (not cache)

## Console Check

1. **Open DevTools** → Console tab
2. **Reload page**
3. **Look for**:
   - [ ] No JavaScript errors
   - [ ] No "Uncaught TypeError" messages
   - [ ] No "Cannot read property" messages related to nav
   - [ ] Nav element found: `console.log(document.getElementById('nav'))` should show element

4. **Test in Console**:
   ```javascript
   // Check if nav exists
   const nav = document.getElementById('nav');
   console.log('Nav found:', !!nav);
   
   // Check if dropdown triggers exist
   const triggers = document.querySelectorAll('.nav-drop-trigger');
   console.log('Dropdown triggers found:', triggers.length);
   
   // Check if dropdowns exist
   const dropdowns = document.querySelectorAll('.nav-drop');
   console.log('Dropdown menus found:', dropdowns.length);
   ```

## Page-Specific Tests

### Index / Home Page
- [ ] All main navigation dropdowns work
- [ ] Three Pillars section loads
- [ ] Hero section renders correctly
- [ ] No layout shifts when dropdowns open

### Knowledge Centre Pages
- [ ] Mega-menu displays properly
- [ ] Sidebar (if present) doesn't interfere
- [ ] FAQ dropdowns work independently
- [ ] Topic filters work correctly

### Module Pages
- [ ] Module navigation dropdown works
- [ ] Back-to-navigation link works
- [ ] Module content loads correctly
- [ ] Related modules dropdown works

### Complex Consolidations
- [ ] Navigation works despite deep folder structure
- [ ] Relative paths resolve correctly
- [ ] Dropdown triggers properly

## Performance Checks

- [ ] Dropdown opens within 100ms
- [ ] Dropdown closes with smooth animation
- [ ] No lag when clicking rapidly
- [ ] Smooth animations (60fps) on mobile
- [ ] Page doesn't jank when dropdowns open

## Issue Documentation

If any tests fail, document:

| Issue | Page | Reproduction | Browser | Screenshot |
|-------|------|-------------|---------|-----------|
| | | | | |
| | | | | |

## Sign-Off

- [ ] All desktop tests passed
- [ ] All mobile tests passed
- [ ] All accessibility tests passed
- [ ] All browser tests passed
- [ ] No console errors
- [ ] Network requests show v=20260901a
- [ ] Ready for production ✅

---

**Test Date**: __________
**Tested By**: __________
**Sign-Off**: __________
