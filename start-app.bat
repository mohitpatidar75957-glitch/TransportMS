@echo off
title Transport Management System Starter
echo ====================================================
echo Starting TMS Frontend and Backend
echo ====================================================

set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot\bin"

echo Starting Backend (Spring Boot with Supabase DB)...
start "TMS Backend (Spring Boot)" cmd /k "set Path=%Path%;C:\Program Files\nodejs;C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot\bin && cd /d "%~dp0backend" && set SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require^&prepareThreshold=0 && set SPRING_DATASOURCE_USERNAME=postgres.jmmszinwlkzkslddldzq && set SPRING_DATASOURCE_PASSWORD=MohitTMS@2026 && set SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver && set SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect && mvnw.cmd spring-boot:run"

echo Starting Frontend (Vite React)...
start "TMS Frontend (Vite)" cmd /k "set Path=%Path%;C:\Program Files\nodejs && cd /d "%~dp0frontend" && npm run dev"

echo.
echo ====================================================
echo Both servers have been launched in separate windows!
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at:  http://localhost:8080
echo ====================================================
timeout /t 5
