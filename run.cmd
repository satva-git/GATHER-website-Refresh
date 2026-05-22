@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "node_modules\express\package.json" (
  echo [run] Installing npm dependencies...
  call npm install --production --no-optional
  if errorlevel 1 (
    echo [run] npm install failed 1>&2
    exit /b 1
  )
)

set "NODE_EXE="
where node >nul 2>&1 && set "NODE_EXE=node"
if not defined NODE_EXE if exist "%ProgramW6432%\nodejs\node.exe" set "NODE_EXE=%ProgramW6432%\nodejs\node.exe"
if not defined NODE_EXE if exist "D:\Program Files (x86)\nodejs\node.exe" set "NODE_EXE=D:\Program Files (x86)\nodejs\node.exe"

if not defined NODE_EXE (
  for /d %%V in ("D:\Program Files (x86)\nodejs\*") do (
    if exist "%%~fV\node.exe" set "NODE_EXE=%%~fV\node.exe"
  )
)

if not defined NODE_EXE (
  echo [run] Node.js executable not found 1>&2
  exit /b 1
)

echo [run] Starting GATHER.nexus server with %NODE_EXE% 1>&2
"%NODE_EXE%" server.js
