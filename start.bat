@echo off
REM FOMO - Start both Frontend and Backend
REM This script starts both the backend (NestJS) and frontend (Angular) servers

echo.
echo 🚀 Starting FOMO - Backend and Frontend
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Get the directory where this script is located
setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Start Backend
echo 📦 Starting Backend (NestJS) on port 3000...
cd backend
call npm install >nul 2>&1
start /b cmd /c npm run start
cd ..

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Frontend
echo 📱 Starting Frontend (Angular) on port 4200...
cd frontend
call npm install >nul 2>&1
start /b cmd /c npm run start
cd ..

echo.
echo ✓ Backend running on http://localhost:3000
echo ✓ Frontend running on http://localhost:4200
echo ✓ To stop the services, close the command windows or press Ctrl+C in each
echo.

pause
