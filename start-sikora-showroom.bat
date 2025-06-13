@echo off
echo ========================================
echo SIKORA Digital Showroom - Lokaler Start
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

REM Starte den lokalen Server
echo 🚀 Starte SIKORA Digital Showroom...
echo.
echo 📱 Die App öffnet sich automatisch in deinem Browser
echo 🌐 URL: http://localhost:5173
echo.
echo ⏹️ Zum Beenden: Strg+C drücken
echo.

REM Öffne Browser automatisch
timeout /t 3 /nobreak >nul
start http://localhost:5173

REM Starte Vite Development Server
npm run dev 