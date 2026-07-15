# Manual Testing Guide - Comment System v3.0

## Before You Begin

### Important: Clear Cache
The CSS changes need to be fully loaded. Follow these steps:

**Windows (Chrome/Edge):**
- Press `Ctrl + Shift + Delete` to open Clear Browsing Data
- Select "Cached images and files"
- Click "Clear data"
- OR: Press `Ctrl + Shift + R` for hard refresh

**Mac (Chrome/Safari):**
- Press `Cmd + Shift + Delete` (Chrome) or `Cmd + Option + E` (Safari)
- Select cache options
- Click clear
- OR: Press `Cmd + Shift + R` for hard refresh

---

## Test Scenario 1: Tab-Specific Comments (CRITICAL)

### Objective
Verify that comments created on one tab only appear on that tab.

### Steps

1. **Navigate to Product Journey section**
   - Scroll to "Our Unified Multi-Entity Platform" section
   - Verify 5 tabs are visible: Overview, Solution, Intercompany, Reporting, Planning

2. **Create comment on Tab 1 (Overview)**
   - Click Tab 1 to make sure it's active
   - Right-click on any text in the Overview tab
   - Select "Add comment here"
   - Type: "Comment on Tab 1"
   - Submit the comment
   - Verify comment appears in the right panel
   - Verify comment #1 pin appears on page

3. **Switch to Tab 2 (Solution) - CRITICAL CHECK**
   - Click on Tab 2
   - 👀 **VERIFY**: Comment #1 is NO LONGER visible ✓
   - 👀 **VERIFY**: Right panel shows "0 comments on this tab" or similar ✓
   - 👀 **VERIFY**: No pins visible on page ✓

4. **Create comment on Tab 2**
   - Right-click on text in Tab 2
   - Select "Add comment here"
   - Type: "Comment on Tab 2"
   - Submit
   - Verify comment appears as #1 (numbering restarts!) ✓

5. **Jump to Tab 5 (Planning)**
   - Click Tab 5
   - 👀 **VERIFY**: Only Tab 2's comment should be gone ✓
   - 👀 **VERIFY**: Right panel shows "0 comments" ✓
   - 👀 **VERIFY**: No pins visible ✓

6. **Create comment on Tab 5**
   - Right-click on text in Tab 5
   - Add comment: "Comment on Tab 5"
   - Submit
   - Verify appears as #1 again ✓

7. **Switch back to Tab 1**
   - Click Tab 1
   - 👀 **VERIFY**: ONLY comment from Tab 1 appears ✓
   - 👀 **VERIFY**: Still numbered as #1 ✓
   - 👀 **VERIFY**: Right panel shows "1 comment" ✓

### Expected Result
✅ Each tab shows only its own comments  
✅ Comment numbers reset per tab (#1, #1, #1 on different tabs)  
✅ Switching tabs doesn't show irrelevant comments  

### If Test Fails
- [ ] Verify you hard-refreshed the page
- [ ] Check browser console for errors (F12)
- [ ] Verify tabs are switching properly
- [ ] Check that comments have `tabId` in browser storage

---

## Test Scenario 2: Comment Popup Visual Design

### Objective
Verify the new popover looks professional and follows the design specifications.

### Steps

1. **Open any comment**
   - Click on a comment pin or card in the right panel
   - Popover should appear

2. **Check the header** - MOST IMPORTANT VISUAL ELEMENT
   - [ ] Header has colored background (teal, blue, purple, etc.)
   - [ ] Color matches the comment pin color
   - [ ] Header text is white or readable
   - [ ] Comment number appears (e.g., "#1", "#2")
   - [ ] Author name is displayed
   - [ ] Close button (×) is visible and aligned right

3. **Check the content area**
   - [ ] Section label is displayed (e.g., "Product Journey")
   - [ ] Tab name is displayed if applicable (e.g., "[Overview]")
   - [ ] Comment body text is readable
   - [ ] Line height is comfortable (not cramped)
   - [ ] Timestamp shows below comment body
   - [ ] Buttons are properly spaced

4. **Check the footer**
   - [ ] "Mark resolved" button is visible
   - [ ] "Edit comment" button is visible
   - [ ] "Delete" link is visible
   - [ ] Reply form is below with proper spacing
   - [ ] All buttons have good contrast

5. **Check overall appearance**
   - [ ] No visible borders (should be borderless)
   - [ ] Shadows are subtle but present
   - [ ] Rounded corners (not sharp)
   - [ ] Size is comfortable (420px width)
   - [ ] Feels modern and professional

### Expected Result
✅ Popover looks premium and modern  
✅ All elements are visible and readable  
✅ Color scheme is consistent  
✅ No visual clutter or confusion  

### If Test Fails
- [ ] Check that CSS was fully loaded (hard refresh)
- [ ] Verify shadow colors in dev tools
- [ ] Check browser compatibility (Chrome, Firefox, Safari)

---

## Test Scenario 3: Overlay Effect (Marker Hiding)

### Objective
Verify that comment markers are hidden under the dark overlay, not creating visual confusion.

### Steps

1. **Click a comment to open popover**
   - Observe the dark overlay appearing
   - Look at the page background

2. **Check marker visibility**
   - 👀 **CRITICAL**: Comment pins should be INVISIBLE or barely visible ✓
   - 👀 Background should appear blurred
   - 👀 No sharp pins showing through dark overlay
   - 👀 Eyes should naturally focus on the popover

3. **Compare before and after**
   - If pins are clearly visible: ❌ BUG
   - If pins are hidden/blurred: ✅ CORRECT

### Expected Result
✅ Comment markers completely hidden under overlay  
✅ Blur effect is visible on background  
✅ Natural focus on the popover  

### If Test Fails
- [ ] Check backdrop filter support in browser
- [ ] Verify CSS blur value is 3px
- [ ] Check overlay opacity is 0.55 or higher
- [ ] Try another browser (Safari has best support)

---

## Test Scenario 4: Tab Badge Display

### Objective
Verify that tab names are readable and properly humanized.

### Steps

1. **Open a comment** on the Tab 2 (Solution tab)
   - Look for tab information in the popover

2. **Check tab badge**
   - If comment is on "Overview" tab: Should show "[Overview]" ✓
   - If comment is on "Solution" tab: Should show "[Solution]" ✓
   - If comment is on "Intercompany": Should show "[Intercompany]" ✓
   - NOT: "(Tab: journey-panel-overview)" ❌

3. **Check badge styling**
   - [ ] Badge has subtle background color
   - [ ] Badge text is readable
   - [ ] Badge styling matches overall design

### Expected Result
✅ Tab names are human-readable  
✅ No raw IDs like "journey-panel-*"  
✅ Badge styling is professional  

### If Test Fails
- [ ] Verify `humanizeTabId` function is in review.js
- [ ] Check comment's `tabId` property value
- [ ] Verify CSS for `.rv-badge-tab` exists

---

## Test Scenario 5: Cross-Browser Compatibility

### Objective
Verify the comment system works across different browsers.

### Steps

1. **Test in Chrome/Edge**
   - Create comments
   - Switch tabs
   - Open popover
   - 👀 All visual effects should work

2. **Test in Firefox**
   - Repeat above steps
   - Verify blur effect works
   - Verify colors display correctly

3. **Test in Safari**
   - Repeat above steps
   - Blur effect may be less pronounced (OK - graceful degradation)
   - Everything else should work

4. **Test on Mobile** (if applicable)
   - Use tap mode
   - Create comments
   - Verify popover is centered
   - Verify readable on small screen

### Expected Result
✅ Works in all modern browsers  
✅ Visual effects optimized per browser  
✅ Responsive on mobile  

---

## Test Scenario 6: Three Pillars Section

### Objective
Verify tab filtering works for Three Pillars section too.

### Steps

1. **Navigate to Three Pillars section**
   - Scroll down to find it
   - Should show 3 pillar panels

2. **Create comment on Pillar 1**
   - Right-click in Pillar 1 area
   - Add comment: "Comment on Pillar 1"

3. **Create comment on Pillar 2**
   - Click Pillar 2
   - Right-click in Pillar 2 area
   - Add comment: "Comment on Pillar 2"

4. **Switch back to Pillar 1**
   - Click Pillar 1
   - 👀 **VERIFY**: Only Pillar 1's comment visible ✓
   - 👀 **VERIFY**: No Pillar 2 comment showing ✓

### Expected Result
✅ Three Pillars filtering works like Product Journey  
✅ Comments stay on correct pillar  

---

## Test Scenario 7: Color Consistency

### Objective
Verify colors match between pins and popover headers.

### Steps

1. **Create 3+ comments** on same tab

2. **Check color consistency**
   - Comment #1 pin color = Comment #1 popover header color ✓
   - Comment #2 pin color = Comment #2 popover header color ✓
   - Comment #3 pin color = Comment #3 popover header color ✓

3. **Expected color sequence**
   - #1 = Teal
   - #2 = Blue
   - #3 = Purple
   - #4 = Rose
   - #5 = Amber
   - (etc. for 10 total colors)

### Expected Result
✅ Pin colors match popover header colors  
✅ Color sequence is consistent  
✅ Easy to visually connect pins with popovers  

---

## Test Scenario 8: Resolve/Reopen Functionality

### Objective
Verify comment status changes work properly.

### Steps

1. **Create a comment**
   - Add any comment

2. **Mark as Resolved**
   - Open the popover
   - Click "Mark resolved" button
   - 👀 Button should change to "Reopen"
   - 👀 Pin should appear grayed out/dimmed
   - 👀 Badge should change to "Resolved"

3. **Reopen the comment**
   - Click "Reopen" button
   - 👀 Button should change back to "Mark resolved"
   - 👀 Pin should return to normal color
   - 👀 Badge should change back to "Open"

4. **Switch tabs and back**
   - Switch to another tab
   - Switch back to original tab
   - Status should be preserved ✓

### Expected Result
✅ Status changes work correctly  
✅ Visual updates happen instantly  
✅ Status persists across tab switches  

---

## Test Scenario 9: Comment Editing

### Objective
Verify you can edit comments properly.

### Steps

1. **Open a comment popover**
   - Click on any comment

2. **Click "Edit comment" button**
   - Text should change to an editable form
   - Current comment text should appear in textarea

3. **Edit the text**
   - Clear current text
   - Type new text
   - Click "Save"
   - New text should appear in popover

4. **Verify changes persist**
   - Close popover
   - Reopen same comment
   - 👀 New text should still be there ✓

### Expected Result
✅ Edit functionality works  
✅ Changes are saved properly  
✅ Text displays correctly after edit  

---

## Test Scenario 10: Reply Functionality

### Objective
Verify you can reply to comments.

### Steps

1. **Open a comment popover**
   - Click on any comment

2. **Scroll to reply form** (at bottom)
   - Form should show author name field and reply text area

3. **Add a reply**
   - Enter author name
   - Type reply message
   - Click "Reply" button

4. **Verify reply appears**
   - Reply should show up in "Replies" section
   - Author name should display
   - Reply text should display
   - Timestamp should show

### Expected Result
✅ Replies can be added  
✅ Replies display properly  
✅ Multiple replies can accumulate  

---

## Comprehensive Checklist

### Core Functionality
- [ ] Comments appear only on correct tab
- [ ] Tab switching shows correct comments
- [ ] Comment count is accurate per tab
- [ ] Creating comments on different tabs works
- [ ] Three Pillars section filters comments too

### Visual Design
- [ ] Popover header has colored background
- [ ] Comment number displayed (#1, #2, etc.)
- [ ] Author name and avatar visible
- [ ] Tab badge displays correctly
- [ ] All text is readable
- [ ] Spacing looks professional
- [ ] No visual clutter

### Overlay Effect
- [ ] Dark overlay appears when popover opens
- [ ] Comment pins are invisible under overlay
- [ ] Background is blurred
- [ ] Focus naturally on popover

### Colors & Styling
- [ ] Pin colors match header colors
- [ ] Status badges display correctly
- [ ] Button styling is consistent
- [ ] Close button is visible and works

### Interactions
- [ ] Click pin → popover opens
- [ ] Click card → popover opens
- [ ] Click close button → popover closes
- [ ] Drag popover → moves smoothly
- [ ] Switch tabs while open → popover closes

### Functionality
- [ ] Resolve/Reopen works
- [ ] Edit comment works
- [ ] Delete comment works
- [ ] Reply to comment works
- [ ] All actions save properly

### Cross-Browser
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile view works

---

## Troubleshooting

### Issue: Comments still showing on all tabs

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear entire cache: Settings → Clear browsing data
3. Close and reopen browser
4. Check browser console (F12) for JavaScript errors

### Issue: Popover still looks old

**Solution:**
1. Hard refresh (Ctrl+Shift+R)
2. Clear cache entirely
3. Check that CSS file is loaded (F12 → Network tab)
4. Try in Incognito/Private mode

### Issue: Comment markers still visible under overlay

**Solution:**
1. Try different browser (Safari/Firefox)
2. Check browser version (need recent version for `backdrop-filter`)
3. In older browsers, overlay may not blur (but still focus)
4. This is expected behavior in very old browsers

### Issue: Tab names showing raw IDs

**Solution:**
1. Hard refresh page
2. Check JavaScript console for errors
3. Verify `humanizeTabId` function exists in review.js
4. Check comment's `tabId` property in browser storage

### Issue: Colors not matching between pin and header

**Solution:**
1. Hard refresh
2. Check that comments are on same tab
3. Verify CSS variables are loaded
4. Try in different browser

---

## Performance Notes

### Expected Performance
- Popover opens: ~200-300ms (smooth animation)
- Tab switching: Instant
- Comments update: ~50-100ms
- No lag or stuttering

### If Performance is Poor
1. Check browser console for errors
2. Verify no other scripts interfering
3. Try closing other browser tabs
4. Restart browser if necessary

---

## Final Sign-Off

When all tests pass, you can confirm:

✅ Tab-specific comments working correctly  
✅ Visual design is professional and modern  
✅ Overlay effect properly hides markers  
✅ Popover size is optimized  
✅ All interactions work smoothly  
✅ Cross-browser compatible  
✅ Production-ready  

**Status**: Ready for client review! 🎉

