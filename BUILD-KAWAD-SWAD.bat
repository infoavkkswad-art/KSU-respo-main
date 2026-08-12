@echo off
setlocal
title KAWAD SWAD - Production Build Helper
cd /d "%~dp0"

echo.
echo ==============================================
echo   KAWAD SWAD - PRODUCTION BUILD
echo ==============================================
echo.
echo This tool prepares the finished website for GoDaddy.
echo It does NOT deploy anything.
echo.

if not exist "package.json" (
  echo ERROR: package.json was not found.
  echo.
  echo Put this BAT file in the main KSU-respo-main project folder.
  pause
  exit /b 1
)

echo [1/5] Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: Node.js is not installed.
  echo Install the current LTS version of Node.js, then run this again.
  echo.
  pause
  exit /b 1
)

echo Node:
node --version
echo npm:
npm --version
echo.

echo [2/5] Installing project packages...
call npm install
if errorlevel 1 (
  echo.
  echo ERROR: npm install failed.
  echo Please send the full error message to ChatGPT.
  pause
  exit /b 1
)

echo.
echo [3/5] Type checking...
call npm run typecheck
if errorlevel 1 (
  echo.
  echo ERROR: Typecheck failed.
  echo Please send the error to ChatGPT. Do not change random files.
  pause
  exit /b 1
)

echo.
echo [4/5] Linting...
call npm run lint
if errorlevel 1 (
  echo.
  echo ERROR: Lint failed.
  echo Please send the error to ChatGPT.
  pause
  exit /b 1
)

echo.
echo [5/5] Creating production website...
if exist "dist" rmdir /s /q "dist"

set "VITE_API_BASE_URL=https://api.kawadswad.com"
call npm run build
if errorlevel 1 (
  echo.
  echo ERROR: Production build failed.
  echo Please send the error to ChatGPT.
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo.
  echo ERROR: Build finished but dist\index.html was not created.
  pause
  exit /b 1
)

echo.
echo ==============================================
echo   BUILD SUCCESSFUL
echo ==============================================
echo.
echo Typecheck: PASS
echo Lint:      PASS
echo Build:     PASS
echo.
echo Production website folder:
echo %cd%\dist
echo.

echo Creating a clean GoDaddy deployment ZIP...
if exist "KAWAD-SWAD-GODADDY-FRONTEND.zip" del /q "KAWAD-SWAD-GODADDY-FRONTEND.zip"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$src=(Resolve-Path 'dist').Path; $zip=(Join-Path (Get-Location) 'KAWAD-SWAD-GODADDY-FRONTEND.zip'); Compress-Archive -Path (Join-Path $src '*') -DestinationPath $zip -Force"

if errorlevel 1 (
  echo.
  echo WARNING: Website build succeeded, but ZIP creation failed.
  echo You can still upload the contents of the dist folder to GoDaddy.
  pause
  exit /b 0
)

echo.
echo ==============================================
echo   GODADDY ZIP CREATED
echo ==============================================
echo.
echo %cd%\KAWAD-SWAD-GODADDY-FRONTEND.zip
echo.
echo IMPORTANT:
echo Do NOT upload the source project.
echo Do NOT upload node_modules.
echo Do NOT upload backend.
echo Upload/extract the contents of this ZIP into GoDaddy /public_html.
echo.
echo NOTE:
echo The frontend is configured to use:
echo https://api.kawadswad.com
echo The FastAPI backend must be deployed separately before
echo orders/forms can work on the live website.
echo.
pause
