@echo off
REM EE Script Extractor - launcher (no proxy needed).
REM Use any of these:
REM   * Double-click, then paste the URL when prompted
REM   * Drag an URL shortcut onto this file
REM   * Run:  extract.bat https://your.users.earthengine.app/view/app
setlocal
echo ============================================
echo   EE Script Extractor  (no proxy, no setup)
echo ============================================
echo.
set "APPURL=%~1"
if "%APPURL%"=="" set /p APPURL="Paste the Earth Engine app URL and press Enter: "
if "%APPURL%"=="" (
  echo No URL entered. Exiting.
  pause
  exit /b 1
)
echo.
node "%~dp0extract.js" "%APPURL%"
echo.
echo Done. Your source is saved as ee-app-source.js in this folder.
echo.
pause
