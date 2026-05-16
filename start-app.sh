#!/bin/bash

echo "================================================"
echo "  Thesis Repository System - Startup Script"
echo "================================================"
echo ""

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo "[ERROR] .NET SDK not found. Please install .NET 8.0 SDK"
    echo "Download from: https://dotnet.microsoft.com/download"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Please install Node.js"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "[ERROR] pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

echo "[INFO] All prerequisites found!"
echo ""
echo "Starting backend (C# API)..."
echo "================================================"
cd backend
dotnet run &
BACKEND_PID=$!
cd ..

echo ""
echo "Waiting for backend to start (5 seconds)..."
sleep 5

echo ""
echo "Starting frontend (React)..."
echo "================================================"
pnpm dev &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "  Both services are running!"
echo "================================================"
echo ""
echo "Backend (API):     http://localhost:5000"
echo "Backend (Swagger): http://localhost:5000/swagger"
echo "Frontend (App):    http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
