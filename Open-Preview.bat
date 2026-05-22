@echo off
cd /d "%~dp0"
start "" "http://localhost:3000/?review=ade20793493210f2321bfbf8cc64278a"
start "" "http://localhost:3000/admin/"
npm run preview
