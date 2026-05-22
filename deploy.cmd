@if "%SCM_DO_BUILD_DURING_DEPLOYMENT%"=="true" (
  echo Installing npm dependencies on Azure...
  call npm install --production --no-optional
  if errorlevel 1 exit /b 1
)
echo Azure deploy complete.
