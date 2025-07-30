@echo off
title Start Symbiosis Management System

echo ========================================
echo    Symbiosis Management System
echo ========================================
echo.

:: Git pull from root directory
echo [1/2] Pulling latest changes from Git...
git pull
if %errorlevel% neq 0 (
    echo Error: Git pull failed!
    pause
    exit /b 1
)
echo Git pull completed successfully!
echo.

:: Start frontend  
echo [2/2] Starting frontend...
start "Frontend Server" cmd /k "cd frontend && echo Starting frontend... && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
exit
