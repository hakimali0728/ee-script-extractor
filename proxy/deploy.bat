@echo off
REM One-click Cloudflare Worker deploy for EE Script Extractor.
REM Deploys from the repo ROOT (uses the root wrangler.toml -> proxy/worker.js).
cd /d "%~dp0.."
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
