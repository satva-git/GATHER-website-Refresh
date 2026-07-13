# Quick Start: Share Website for Client Review

**Get your client reviewing in 2 minutes** ⚡

---

## Step 1: Run the share command

```bash
npm run share
```

Wait for the magic URL to appear. You'll see:

```
>>> SEND THIS LINK TO YOUR CLIENT <<<
https://brave-river-12345.trycloudflare.com/?review=TOKEN
```

Copy that link. **Keep the terminal window open.**

---

## Step 2: Send link to client

1. Copy the `https://` URL above
2. Send it to your client via email, Slack, Teams, etc.
3. Include: **"Click the link and right-click anywhere on the page to leave feedback"**

---

## Step 3: Client leaves feedback

Client does this:
1. Click the link
2. Right-click on any page section
3. Click **"Add comment here"**
4. Enter name + feedback
5. Click **"Post comment"**

Feedback appears instantly as a numbered pin. ✅

---

## Step 4: You review & reply

1. View feedback in real-time as client adds comments
2. Click any pin to open the comment thread
3. Click **"Reply"** to respond
4. Your reply appears instantly to client
5. Click **"Mark resolved"** when complete

---

## Step 5: When done

- Press **Ctrl+C** in the terminal to stop the tunnel
- Link expires automatically after 5–6 days

---

## That's it!

**No account needed. No infrastructure setup. Just feedback.**

---

## What if something goes wrong?

| Problem | Solution |
|---------|----------|
| "Port 3000 in use" | `Stop-Process -MatchName "node" -Force` then retry |
| Cloudflare fails | Runs localtunnel automatically instead |
| Link expired | Just run `npm run share` again |
| Comments not syncing | Refresh the page, or restart with `npm run share` |

---

## Local testing first?

Test locally before sharing:

```bash
npm run preview
```

Then open: http://localhost:3000/?review=ade20793493210f2321bfbf8cc64278a

---

## Detailed docs?

- **Full workflow:** See `COLLABORATION-GUIDE.md`
- **For client:** Share `CLIENT-FEEDBACK-INSTRUCTIONS.md`
- **Deployment info:** See `DEPLOYMENT-STATUS.md`

---

**Ready? Run:** `npm run share`
