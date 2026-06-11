@echo off
REM One-click Cloudflare Worker deploy for EE Script Extractor.
REM Double-click this file. It will:
REM   1. Log you into Cloudflare (opens your browser the first time)
REM   2. Deploy the worker and print its URL
cd /d "%~dp0"
echo ============================================
echo   Deploying EE Script Extractor proxy
echo ============================================
echo.
echo Step 1/2: Cloudflare login (a browser window will open - click Allow)
call npx --yes wrangler login
echo.
echo Step 2/2: Deploying the worker...
call npx --yes wrangler deploy
echo.
echo ============================================
echo   Copy the URL above (https://...workers.dev)
echo   and paste it into the site's Proxy settings.
echo ============================================
pause
