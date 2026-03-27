@echo off
REM FOMO - Start both Frontend and Backend

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

setlocal enabledelayedexpansion
cd /d "%~dp0"

REM ========================
REM Start Backend
REM ========================
echo 📦 Starting Backend (NestJS)...

cd backend
call npm install

echo 🛠️ Running Drizzle migrations...
call npx drizzle-kit migrate

echo ▶️ Starting backend server...
start cmd /k npm run start:dev

cd ..

REM Wait a moment
timeout /t 3 /nobreak >nul

REM ========================
REM Start Frontend
REM ========================
echo 📱 Starting Frontend (Angular)...

cd frontend
call npm install

start cmd /k npm run start

cd ..

echo.
echo ✓ Backend running on http://localhost:3000
echo ✓ Frontend running on http://localhost:4200
echo.
echo ⚠️ Close the opened terminals to stop services
echo.

pause