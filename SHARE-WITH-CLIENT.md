# Share GATHER.nexus homepage preview with your client

All design updates live in **`HomePage.html`**. After you edit that file, run `npm run sync` (or `npm run preview`, which syncs automatically) so **`index.html`** stays in sync for sharing.

## Client review comments (recommended)

Use the built-in review server so clients can leave feedback directly on the page.

### 1. Start the preview server

```bash
cd e:\Howard\New-Website
npm install
npm run preview
```

### 2. Open the admin dashboard

| Page | URL |
|------|-----|
| Admin dashboard | http://localhost:3000/admin/ |
| Homepage preview | http://localhost:3000/ |

In Admin, click **New share link**, give the review a title, and copy the generated URL.

### 3. Send the share link to your client

The link looks like:

`http://localhost:3000/?review=YOUR_TOKEN`

On your network, replace `localhost` with your PC IP (see Option 3 below) so the client can open it on their phone, tablet, or laptop.

### 4. How commenting works for the client

- The page opens in **review mode** with **Add comment** turned on by default.
- They **click anywhere on the page** to point at the exact spot.
- A comment box opens right there — they enter their name and feedback, then submit.
- A numbered pin marks each comment on the page so both sides can see exactly what it refers to.
- Their name is saved in the browser for return visits.

### 5. How your team sees feedback

- Open **Admin** and select the share link to view all comments.
- Updates appear in **real time** while the server is running.
- Mark comments as **Resolved** or delete them when addressed.
- All comments are stored in `server/data/review.db.json` so nothing is lost between sessions.

---

## Option 1 — Send the HTML file (offline only)

1. Zip this folder, or send only **`HomePage.html`** (logo and hero images are embedded in the HTML).
2. Client double-clicks **`HomePage.html`** (or **`index.html`**) to open in Chrome/Edge/Safari.
3. They need internet for Google Fonts and the Xero/QuickBooks partner logo sprite from gather.nexus.
4. After you replace files in `assets/images/`, run **`npm run embed`** before re-sharing so the HTML stays self-contained.

**Note:** Commenting requires the review server (`npm run preview`). Opening the HTML file directly will not save feedback.

## Option 2 — Local preview link (your machine)

```bash
cd e:\Howard\New-Website
npm run preview
```

Then share these URLs on your computer:

| Page | URL |
|------|-----|
| Homepage (default) | http://localhost:3000/ |
| Admin dashboard | http://localhost:3000/admin/ |
| Same page, explicit | http://localhost:3000/HomePage.html |

## Option 3 — Temporary link on your network

While `npm run preview` is running, find your PC’s IP (`ipconfig`), then the client on the same Wi‑Fi can open:

`http://YOUR_IP:3000/?review=YOUR_TOKEN`

(Windows Firewall may prompt you to allow Node.)

## After each design update

1. Save changes in **`HomePage.html`**.
2. Run **`npm run sync`** or **`npm run preview`**.
3. Re-share the same review link — existing client comments stay attached to that link.
