# GATHER Website Refresh

Static marketing site for **GATHER.nexus**, hosted on GitHub Pages.

## Live site

**https://satva-git.github.io/GATHER-website-Refresh/**

## GitHub repository

**https://github.com/satva-git/GATHER-website-Refresh**

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

This repo deploys automatically via GitHub Actions (`.github/workflows/pages.yml`) whenever you push to `main`.

To publish updates after editing `HomePage.html`:

```powershell
npm run sync
git add HomePage.html index.html
git commit -m "Update homepage"
git push
```

Or run the helper script:

```powershell
.\scripts\publish-github.ps1
```
