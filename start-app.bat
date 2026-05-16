@echo off
echo ============================================================
echo   Thesis Repository System - Startup Script
echo   Database: CPE\SQLEXPRESS / ThesisRepositoryDB
echo ============================================================
echo.

REM Check prerequisites
where dotnet >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] .NET 8 SDK not found.
    echo Download from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Prerequisites OK.
echo.
echo ============================================================
echo  STEP 1 — Apply schema patches to SSMS database
echo  Open SSMS and run:  backend\SQL\2_AlterDatabase.sql
echo  (only needed once; the backend also handles this at startup)
echo ============================================================
echo.

echo Starting backend (C# ASP.NET Core)...
echo   URL   : http://localhost:5000
echo   Swagger: http://localhost:5000/swagger
start cmd /k "cd backend && dotnet run"

echo.
echo Waiting for backend to initialise (8 seconds)...
timeout /t 8 /nobreak >nul

echo.
echo Starting frontend (React / Vite)...
echo   URL: http://localhost:5173
start cmd /k "pnpm dev"

echo.
echo ============================================================
echo   Both services started!
echo ============================================================
echo.
echo   Backend API : http://localhost:5000/api
echo   Swagger UI  : http://localhost:5000/swagger
echo   Frontend    : http://localhost:5173
echo.
echo   Credentials (do NOT display in UI):
echo     admin@thesis.com    / AdminPass123!
echo     faculty@thesis.com  / password123
echo     student@thesis.com  / password123
echo     uploader@thesis.com / password123
echo     approver@thesis.com / password123
echo.
echo Press any key to close this window (services keep running)
pause >nul
