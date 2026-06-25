# GATHER Website Refresh

Static marketing site for **GATHER.nexus**, hosted on GitHub Pages.

## Live site

After GitHub Pages is enabled, the site will be available at:

**https://dixit270592.github.io/GATHER-website-Refresh/**

## Project structure

```
GATHER-website-Refresh/
├── index.html              # Main homepage (entry point for GitHub Pages)
├── assets/                 # CSS and JavaScript extensions
├── review/                 # Optional client review UI (needs ?review= token)
├── .nojekyll               # Tells GitHub Pages not to use Jekyll processing
└── README.md
```

## Local preview

Open `index.html` in a browser, or run:

```bash
npm install
npm run preview:static
```

Then visit http://localhost:3000

## GitHub Pages setup

1. Push this repository to GitHub.
2. Open **Settings → Pages** in the repository on GitHub.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main**, folder **/ (root)**, then click **Save**.
5. Wait 1–3 minutes for the first deploy. The live URL appears at the top of the Pages settings page.
