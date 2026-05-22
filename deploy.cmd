@if not exist "node_modules\express\package.json" (
  echo Installing npm dependencies on Azure...
  call npm install --production --no-optional
  if errorlevel 1 exit /b 1
) else (
  echo node_modules already present; skipping npm install.
)
echo Azure deploy complete.
