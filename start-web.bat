@echo off
REM EE Script Extractor - start the local web app (Python backend, no proxy).
REM Double-click this file, then use the browser window that opens.
cd /d "%~dp0"
echo Starting EE Script Extractor at http://localhost:8000 ...
start "" http://localhost:8000
python server.py
pause
