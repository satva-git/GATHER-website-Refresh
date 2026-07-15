# Quick Reference: Enhanced Comment System

## What's New? 🎉

Your comment system has been completely redesigned with focus on **clarity, organization, and usability**.

---

## Key Features at a Glance

### 1. **Tab-Specific Comments** 📑
Comments are now linked to specific tabs. When you switch between Product Journey or Three Pillars tabs, you'll only see comments for that particular tab.

- ✅ No more mixed-up comments across tabs
- ✅ Comments automatically follow you between tabs
- ✅ Shows count of comments on other tabs

### 2. **Color-Coded Comments** 🎨
Each comment has a unique color that makes it super easy to identify and match pins on the page.

- Comment #1: Teal
- Comment #2: Blue  
- Comment #3: Purple
- ...and 7 more vibrant colors!

### 3. **Improved Focus** 🎯
When you click on a comment to read it, the interface focuses entirely on that comment.

- ✅ Right panel slides away automatically
- ✅ Darker overlay emphasizes the comment
- ✅ Comment header shows its unique color
- ✅ Comment number displayed prominently

### 4. **Better Popover Design** ✨
Comment popups now have a modern, clean design with better spacing and hierarchy.

- Colored header bar matches the comment color
- Comment number in a colored badge
- Better visual hierarchy for actions
- Smooth animations

### 5. **Show/Hide Comments** 👁️
Temporarily hide all comment pins on the page without losing them.

- Look for the eye icon (👁️) in the top bar
- Click to hide all pins
- Click again to show them
- Comments still visible in the right panel

---

## How to Use

### Adding a Comment
```
Desktop: Right-click → "Add comment here"
Mobile: Tap the "+ Add" button, then tap the page
```

The comment will automatically be assigned to the current tab!

### Viewing a Comment
```
Option 1: Click the colored number pin on the page
Option 2: Click a comment card in the right panel
```

The comment will open with a colored header showing which tab it belongs to.

### Managing Comments
```
Hide all pins: Click the 👁️ icon in the top bar
Show all pins: Click the 🔒 icon in the top bar
Switch tabs: Comments update automatically
```

### Identifying Comments
```
Pin color → Matches the comment header color
Pin number → Matches the comment card badge
Makes it easy to connect pins with their comments!
```

---

## Visual Guide

```
┌─────────────────────────────────────────────┐
│ Review Mode  [●●] Live  [+ Add] [Comments 3]│  ← Top bar
│ [Hide pins] button appears when you have comments
└─────────────────────────────────────────────┘

Page Content
  ● ← Color #1 (Teal)
  ● ← Color #2 (Blue)
  ● ← Color #3 (Purple)

     ┌──────────────────────────┐
     │ [#1] Jane Client [OPEN] │  ← Comment header 
     │ ─────────────────────── │     with color
     │ Feedback text...        │
     │ Posted 2 hours ago      │
     │ ─────────────────────── │
     │ [Mark resolved] [Edit]  │
     │ [Delete]                │
     │ ─────────────────────── │
     │ Replies...              │
     └──────────────────────────┘
```

---

## Tips & Tricks

### 💡 Pro Tips

1. **Color matching**: Match the pin color to the card color to quickly find the comment you're looking for

2. **Tab navigation**: Use the Product Journey tabs to review feedback section by section

3. **Hide for clarity**: Use the Hide button when you need to focus on the page without visual distractions

4. **Check empty tabs**: When a tab shows "No comments on this tab", you'll see how many are on other tabs

5. **Resolved status**: Look for grayed-out pins - those are resolved comments

### 🎯 Workflow

1. **Review by section**: Switch between tabs to review feedback for each section
2. **Identify issues**: Use colors to quickly spot which comments relate to each other
3. **Focus mode**: Click a pin to enter focus mode - panel hides automatically
4. **Manage**: Use Hide button when you need uncluttered view

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| <kbd>Escape</kbd> | Close comment popup |
| <kbd>Right-Click</kbd> | Open comment menu |
| (mobile) Tap "+" | Enter tap-to-comment mode |

---

## Frequently Asked Questions

**Q: Why did my comment disappear?**
A: It didn't! You may have switched tabs. Each comment is linked to the tab where you created it. Switch back to see it.

**Q: Can I change the colors?**
A: Colors are automatically assigned based on the comment order. They're consistent and make identification easier!

**Q: What if I hide the pins?**
A: They're still in the comments panel on the right - just not visible on the page. Click "Show pins" to bring them back.

**Q: Do tab-specific comments work on all pages?**
A: Yes! Any page with tabbed content will support tab-specific comments. Single-tab or regular pages work normally.

**Q: Can I move a comment to a different tab?**
A: Comments are created on the tab you're viewing. To comment on a different section, switch tabs first.

---

## What Changed Under the Hood?

- **Technical**: Comments now store which tab they were created on (`tabId`)
- **Visual**: 10 distinct colors automatically assigned to comments
- **Experience**: Comments filtered based on active tab
- **UI**: Improved popovers with colored headers and better styling
- **Control**: New show/hide pins feature for managing visual clutter

**Result**: Clearer, more organized, less confusing! ✨

---

## Feedback

If you notice any issues or have suggestions for further improvements, please let us know:

- Comments appearing on wrong tabs? Report it!
- Colors hard to distinguish? Let's adjust!
- Need additional features? We're listening!

---

**Enjoy the improved commenting experience! 🚀**

Last Updated: July 15, 2026
