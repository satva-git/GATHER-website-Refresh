@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo [run] cwd=%CD% 1>&2
echo [run] PORT=%PORT% HTTP_PLATFORM_PORT=%HTTP_PLATFORM_PORT% 1>&2

if not exist "node_modules\express\package.json" (
  echo [run] ERROR express is missing from node_modules 1>&2
  exit /b 1
)

set "NODE_EXE="
if exist "D:\Program Files (x86)\nodejs\node.exe" set "NODE_EXE=D:\Program Files (x86)\nodejs\node.exe"
if not defined NODE_EXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODE_EXE if exist "%ProgramW6432%\nodejs\node.exe" set "NODE_EXE=%ProgramW6432%\nodejs\node.exe"
if not defined NODE_EXE (
  for /d %%V in ("D:\Program Files (x86)\nodejs\*") do (
    if exist "%%~fV\node.exe" set "NODE_EXE=%%~fV\node.exe"
  )
)
if not defined NODE_EXE where node >nul 2>&1 && set "NODE_EXE=node"

if not defined NODE_EXE (
  echo [run] ERROR Node.js executable not found 1>&2
  exit /b 1
)

echo [run] node=%NODE_EXE% 1>&2
"%NODE_EXE%" --version 1>&2
"%NODE_EXE%" server.js
exit /b %ERRORLEVEL%
