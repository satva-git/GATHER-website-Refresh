# Publish GATHER website to GitHub Pages
# Run from PowerShell after: gh auth login

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Checking GitHub login..."
gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Please log in first:" -ForegroundColor Yellow
  Write-Host "  gh auth login"
  exit 1
}

Write-Host "Syncing HomePage.html -> index.html..."
npm run sync

Write-Host "Creating repo if needed..."
$repo = "dixit270592/GATHER-website-Refresh"
gh repo view $repo 2>$null
if ($LASTEXITCODE -ne 0) {
  gh repo create GATHER-website-Refresh --public --description "GATHER.nexus website refresh"
}

Write-Host "Setting remote origin..."
git remote remove origin 2>$null
git remote add origin "https://github.com/$repo.git"

Write-Host "Committing changes..."
git add HomePage.html index.html assets review .nojekyll README.md .github/workflows/pages.yml scripts/publish-github.ps1
git add -u
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m "Prepare static site for GitHub Pages deployment."
}

Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Enabling GitHub Pages..."
gh api repos/$repo/pages -X POST -f build_type=workflow 2>$null
if ($LASTEXITCODE -ne 0) {
  gh api repos/$repo/pages -X PUT -f build_type=workflow 2>$null
}

Write-Host ""
Write-Host "Done. Site will be live at:" -ForegroundColor Green
Write-Host "  https://dixit270592.github.io/GATHER-website-Refresh/"
Write-Host ""
Write-Host "Check deploy status:" -ForegroundColor Cyan
Write-Host "  gh run list --workflow=pages.yml"
Write-Host "  https://github.com/$repo/actions"
