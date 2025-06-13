@echo off
echo ========================================
echo SIKORA Digital Showroom - Vollstart
echo ========================================
echo.

REM Prüfe Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js ist nicht installiert
    echo Lade Node.js herunter: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js gefunden: 
node --version

REM Installiere Dependencies (falls nötig)
if not exist "node_modules" (
    echo 📦 Installiere Dependencies...
    npm install
)

REM Initialisiere Datenbank (falls nötig)
if not exist "database.sqlite" (
    echo 🗄️ Initialisiere Datenbank...
    npm run db:init
)

echo.
echo 🚀 Starte SIKORA Digital Showroom...
echo.
echo 📊 Backend API: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo.
echo ⏹️ Zum Beenden: Fenster schließen oder Strg+C
echo.

REM Starte Backend-Server in separatem Fenster
start "SIKORA Backend API" cmd /k "npm run db:server"

REM Warte kurz damit Backend startet
timeout /t 3 /nobreak >nul

REM Öffne Browser automatisch
start http://localhost:5173

REM Starte Frontend-Server
echo 🎨 Starte Frontend-Server...
npm run dev 