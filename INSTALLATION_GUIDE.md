# SIKORA Digital Showroom - Installation & Startup Guide

## 🚀 Schnellstart

Die SIKORA Digital Showroom Anwendung kann auf verschiedene Weise gestartet werden:

### Option 1: Einfacher Start (Empfohlen)
```bash
# Doppelklick auf eine der Starter-Dateien:
start-sikora-showroom.bat     # Für Windows (Batch)
start-sikora-showroom.ps1     # Für Windows (PowerShell)
```

### Option 2: PowerShell mit Optionen
```powershell
# Standard-Modus
.\start-sikora-showroom.ps1

# Debug-Modus (mit Developer Tools)
.\start-sikora-showroom.ps1 -Debug

# Production-Modus (falls verfügbar)
.\start-sikora-showroom.ps1 -Production
```

### Option 3: Manueller Start
```bash
# 1. Backend starten
cd DB
node api-server.js

# 2. Frontend starten (neues Terminal)
npm run dev

# 3. Electron App starten (neues Terminal)
npm run electron
```

## 📋 Voraussetzungen

### Erforderlich:
- **Node.js** (Version 18.0.0 oder höher)
  - Download: https://nodejs.org/
- **npm** (Version 8.0.0 oder höher, wird mit Node.js installiert)

### Empfohlen:
- **PowerShell 7** für modernere Windows-Systeme
- **Windows 10/11** für beste Kompatibilität

## 🔧 Installation

### 1. Projekt herunterladen/klonen
```bash
git clone <repository-url>
cd sikora-digital-showroom
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Datenbank initialisieren
```bash
npm run db:init
```

### 4. Anwendung starten
```bash
# Einfachster Weg:
.\start-sikora-showroom.ps1

# Oder manuell:
npm run start
```

## 🛠️ Verfügbare Scripts

### Entwicklung:
```bash
npm run dev              # Frontend Development Server
npm run electron:dev     # Electron Development Mode
npm run electron:dev-debug  # Mit Developer Tools
npm run backend:start    # Backend Server starten
```

### Build & Distribution:
```bash
npm run build           # Frontend für Produktion bauen
npm run pack:win        # Electron App packen (ohne Installer)
npm run dist:win        # Windows Installer erstellen
npm run clean           # Build-Artefakte löschen
```

### Datenbank:
```bash
npm run db:init         # Datenbank initialisieren
npm run db:server       # Datenbank-Server starten
npm run db:test         # Datenbank-Verbindung testen
```

### Wartung:
```bash
npm run lint            # Code-Qualität prüfen
npm run lint:fix        # Code automatisch korrigieren
npm run type-check      # TypeScript-Typen prüfen
```

## 🌐 Ports & URLs

- **Frontend (Development):** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Health Check:** http://localhost:3001/api/health

## 📁 Projektstruktur

```
sikora-digital-showroom/
├── src/                    # React Frontend Quellcode
├── electron/               # Electron Main Process
├── DB/                     # Backend Server & Datenbank
├── assets/                 # Statische Assets (Bilder, 3D-Modelle)
├── dist/                   # Gebauter Frontend Code
├── dist-electron/          # Electron Distribution
├── database.sqlite         # SQLite Datenbank
├── package.json           # Projekt-Konfiguration
├── vite.config.ts         # Frontend Build-Konfiguration
├── start-sikora-showroom.bat   # Windows Batch Starter
├── start-sikora-showroom.ps1   # PowerShell Starter
└── README.md              # Dokumentation
```

## 🔍 Troubleshooting

### Problem: "Node.js ist nicht installiert"
**Lösung:** Installieren Sie Node.js von https://nodejs.org/

### Problem: "Port 3001 ist bereits belegt"
**Lösung:** 
```bash
# Andere Prozesse auf Port 3001 beenden:
netstat -ano | findstr :3001
taskkill /PID <PROCESS_ID> /F
```

### Problem: "Datenbank nicht gefunden"
**Lösung:**
```bash
npm run db:init
```

### Problem: Anwendung startet nicht
**Lösung:**
1. Alle Node.js Prozesse beenden:
   ```bash
   taskkill /IM node.exe /F
   ```
2. Projekt neu starten:
   ```bash
   .\start-sikora-showroom.ps1
   ```

### Problem: Frontend lädt nicht
**Lösung:**
1. Browser-Cache leeren
2. Auf http://localhost:5173 prüfen
3. Frontend neu starten:
   ```bash
   npm run dev
   ```

### Problem: 3D-Modelle laden nicht
**Lösung:**
1. Prüfen ob `assets/models/` existiert
2. Backend-Verbindung prüfen: http://localhost:3001/api/health

## 🎛️ Konfiguration

### Umgebungsvariablen (.env)
```bash
# Erstellen Sie eine .env Datei im Projektroot:
VITE_API_URL=http://localhost:3001
DATABASE_PATH=./database.sqlite
NODE_ENV=development
```

### Ports ändern
**Frontend Port (vite.config.ts):**
```typescript
server: {
  port: 5173, // Ändern Sie hier
  ...
}
```

**Backend Port (DB/api-server.js):**
```javascript
const PORT = process.env.PORT || 3001; // Ändern Sie hier
```

## 📊 Systemanforderungen

### Minimum:
- **RAM:** 4 GB
- **Speicher:** 2 GB freier Speicherplatz
- **Prozessor:** Dual-Core 2 GHz
- **Grafik:** DirectX 11 kompatibel
- **Betriebssystem:** Windows 10 (Build 1809+)

### Empfohlen:
- **RAM:** 8 GB oder mehr
- **Speicher:** 5 GB freier Speicherplatz
- **Prozessor:** Quad-Core 3 GHz
- **Grafik:** Dedizierte GPU mit 2GB VRAM
- **Betriebssystem:** Windows 11

## 🔐 Sicherheit

- Die Anwendung läuft lokal und benötigt keine Internetverbindung
- Alle Daten werden lokal in SQLite gespeichert
- Keine Telemetrie oder externe Datenübertragung

## 📞 Support

Bei Problemen oder Fragen wenden Sie sich an:
- **E-Mail:** support@sikora.net
- **Website:** https://www.sikora.net
- **Dokumentation:** Siehe README.md im Projektverzeichnis

---

**SIKORA AG** - Digitale Innovationen für die Industrie 