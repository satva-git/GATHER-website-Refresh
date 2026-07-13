# GATHER.nexus Website — Client Collaboration Guide

## Quick Start (Recommended)

The easiest way to collaborate with your client on website feedback is using **Cloudflare Tunnel**, which creates a secure public link that works for 5–6 days without any infrastructure setup.

### For You (Designer/Developer)

1. Open a terminal in the project folder
2. Run:
   ```bash
   npm run share
   ```
3. Wait for the public link to appear. You'll see:
   ```
   >>> SEND THIS LINK TO YOUR CLIENT <<<
   https://xxx-xxx-xxx.trycloudflare.com/?review=TOKEN
   ```
4. **Keep this terminal window open** — it keeps the tunnel active
5. Send that link to your client

### For Your Client

1. Click the link you received
2. **Right-click anywhere on the page** to leave feedback
3. Enter your name and comment
4. Click **"Post comment"**
5. Your comment appears as a numbered pin on the page

---

## Full Commenting Workflow

### Client Leaves Feedback
- Right-click the page → **"Add comment here"**
- Enter name, feedback, click submit
- Your comment is instantly visible to both parties

### You Review & Reply
- Click the pin number to open the comment thread
- Click **"Reply"** to respond to the client
- Your reply appears immediately below their comment

### Status Tracking
- Click **"Mark resolved"** when you've addressed their feedback
- Resolved comments appear grayed out but remain visible for audit trail

### Panel & Search
- Click **"Comments"** button (top-right) to see all feedback
- View comment count, jump between sections
- Export feedback as text if needed

---

## Sharing Methods

### Method 1: Cloudflare Tunnel (Recommended) ✅
**Best for:** Quick demos, short-term feedback (5–6 days)

```bash
npm run share
```

- ✅ Works immediately
- ✅ No infrastructure setup
- ✅ Automatically handles network tunneling
- ❌ Requires keeping terminal open
- ❌ Tunnel expires after ~6 days if not renewed

### Method 2: Same Wi-Fi / LAN (Local Network)

```bash
npm run preview
```

Then share your IP:
- Open PowerShell: `ipconfig`
- Find your IPv4 address (e.g., `192.168.0.54`)
- Send to client: `http://192.168.0.54:3000/?review=ade20793493210f2321bfbf8cc64278a`

**Prerequisites:**
- Both on same Wi-Fi network
- Windows Firewall may prompt — click "Allow"

### Method 3: Azure Deployment (Persistent) 🔧
**Best for:** Long-term, production feedback

URL: `https://gather-nexus-new-refreshment-site-gea5ddfae7gwhtbv.uksouth-01.azurewebsites.net/?review=TOKEN`

⚠️ **Current Status:** Azure app is not responding (as of 2026-07-13). See [AZURE-CLIENT-LINK.md](./AZURE-CLIENT-LINK.md) for troubleshooting steps.

---

## Understanding the Three Tiers

| Feature | Local (npm run preview) | Cloudflare Tunnel (npm run share) | Azure Deployment |
|---------|----------------------|-----------------------------------|-----------------|
| Setup | 1 command | 1 command | 10–15 mins |
| Duration | While running | 5–6 days | Permanent |
| Cost | Free | Free | ~$20/month |
| For clients | Same Wi-Fi only | Anyone, anywhere | Anyone, anywhere |
| Comments | Saved in database | Saved in database | Saved in database |
| Real-time sync | Yes (SSE) | Yes (SSE) | Yes (SSE) |

---

## Troubleshooting

### "Address already in use" error

```powershell
# Kill any existing process on port 3000
Stop-Process -MatchName "node" -Force

# Then try again
npm run share
```

### Client can't see my replies

- Ensure your comment thread popover is open and you've clicked "Reply"
- Check the **Comments panel** (top-right) — all comments should appear there
- Refresh the page if stuck

### Comments not persisting

- Comments are stored in `server/data/review.db.json`
- If you see "Offline" status (top-left), the backend isn't responding
- Restart the server: `npm run preview`

### Tunnel expired / can't access link

```bash
# Create a fresh tunnel
npm run share
```

---

## Review Session Tokens

All links use a **review token** to identify the session:

- **Default token:** `ade20793493210f2321bfbf8cc64278a` (built-in for testing)
- **Create new token:** Use `/admin/` → **New Session** button
- **View comments:** Tokens are persistent per session

### Admin Panel

Open `http://localhost:3000/admin/` (or the public equivalent) to:
- View all review sessions
- Create new sessions for different clients/pages
- See comment counts per session
- Export feedback

---

## GitHub Pages (Static Site)

The live site is also deployed on GitHub Pages:
👉 **https://satva-git.github.io/GATHER-website-Refresh/**

- ✅ Right-click comments work (offline mode)
- ❌ Comments are **per-browser only** (not shared)
- Ideal for: Visitors adding personal feedback
- Not ideal for: Collaborative client reviews

**For client collaboration, use Method 1 or 2 above.**

---

## FAQ

**Q: Do I need an Azure account?**
A: No! Use `npm run share` (Cloudflare Tunnel) instead.

**Q: How long does the Cloudflare link last?**
A: Usually 5–6 days. Simply run `npm run share` again if needed.

**Q: Where are comments saved?**
A: In `server/data/review.db.json` (local) or Azure database.

**Q: Can the client see my drafts?**
A: No. Only published comments appear. Drafts are local to your browser.

**Q: What if my internet drops?**
A: Comments are saved. When you reconnect, run `npm run share` again to get a new tunnel URL.

---

## Next Steps

1. **Test locally first:**
   ```bash
   npm run preview
   ```
   Open `http://localhost:3000/?review=ade20793493210f2321bfbf8cc64278a` and try right-click commenting.

2. **Share with client:**
   ```bash
   npm run share
   ```
   Send the public `https://....trycloudflare.com` link.

3. **Stay in sync:**
   Keep the terminal window open while the client reviews.

4. **Export when done:**
   Click **"Comments"** → **"Copy Feedback"** to export all comments as text.

---

**Questions?** Check the code comments in `review/review.js` or server logs (`npm run preview` output).
