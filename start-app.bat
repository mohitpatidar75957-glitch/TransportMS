@echo off
title TMS Application Starter
echo ====================================================
echo Starting TMS Frontend and Backend
echo ====================================================

echo Starting MySQL Service (if not already running)...
net start MySQL80 2>nul

echo Starting Backend (Spring Boot)...
start "TMS Backend (Spring Boot)" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo Starting Frontend (Vite React)...
start "TMS Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ====================================================
echo Both servers have been launched in separate windows!
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at:  http://localhost:8080
echo ====================================================
pause
