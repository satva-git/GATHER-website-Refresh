@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title GATHER.nexus - Client Share Link

echo.
echo  Starting GATHER.nexus with a public client link...
echo.

node scripts/share-public-link.mjs
pause
