#!/bin/bash

# FOMO - Start both Frontend and Backend
# This script starts both the backend (NestJS) and frontend (Angular) servers

echo "🚀 Starting FOMO - Backend and Frontend"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Change to project root directory
cd "$(dirname "$0")"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill %1 %2 2>/dev/null
    echo "✓ Services stopped"
    exit 0
}

# Handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Start Backend
echo "📦 Starting Backend (NestJS) on port 3000..."
cd backend
npm install > /dev/null 2>&1
npm run start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to initialize
sleep 3

# Start Frontend
echo "📱 Starting Frontend (Angular) on port 4200..."
cd frontend
npm install > /dev/null 2>&1
npm run start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✓ Backend running on http://localhost:3000"
echo "✓ Frontend running on http://localhost:4200"
echo "✓ Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
