@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [start-azure] cwd=%CD%
echo [start-azure] PORT=%PORT% HTTP_PLATFORM_PORT=%HTTP_PLATFORM_PORT%

if not exist "node_modules\express\package.json" (
  echo [start-azure] ERROR express is missing from node_modules
  exit /b 1
)

set "NODE_EXE="
if exist "D:\Program Files (x86)\nodejs\node.exe" set "NODE_EXE=D:\Program Files (x86)\nodejs\node.exe"
if not defined NODE_EXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODE_EXE (
  for /d %%V in ("D:\Program Files (x86)\nodejs\*") do (
    if exist "%%~fV\node.exe" set "NODE_EXE=%%~fV\node.exe"
  )
)
if not defined NODE_EXE where node >nul 2>&1 && set "NODE_EXE=node"

if not defined NODE_EXE (
  echo [start-azure] ERROR Node.js executable not found
  exit /b 1
)

echo [start-azure] node=%NODE_EXE%
"%NODE_EXE%" --version
"%NODE_EXE%" server.js
exit /b %ERRORLEVEL%
