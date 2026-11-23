@echo off
setlocal
cd /d "%~dp0"
title KDU Global Student Portal

echo ======================================================================
echo   KYUNGDONG UNIVERSITY GLOBAL (KDU GLOBAL) - STUDENT PORTAL
echo ======================================================================
echo.
echo Initializing Local Database System...
echo.

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python detected. Starting local server on http://localhost:8000...
    echo.
    echo Press Ctrl+C in this terminal if you ever want to stop the server.
    echo Opening Student Portal in your default browser...
    start http://localhost:8000
    python -m http.server 8000
) else (
    echo [Notice] Python not found. Opening index.html directly in browser...
    start "" "index.html"
    echo.
    echo Portal launched directly. You can close this window.
    pause
)

