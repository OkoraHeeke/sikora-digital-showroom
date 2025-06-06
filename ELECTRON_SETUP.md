# Electron SQLite Integration - Setup Guide

## Problem gelöst ✅

Das ursprüngliche Problem war, dass die Electron-App einen separaten Express-Server starten musste, was zu Pfad- und Datenbankverbindungsproblemen führte.

**Neue Lösung**: Direkte SQLite-Integration in Electron mit IPC-Kommunikation.

## Neue Architektur

### Vorher (Problematisch):
```
React App → HTTP → Express Server (separater Prozess) → SQLite3
```

### Nachher (Funktioniert):
```
React App → Electron IPC → Main Process → better-sqlite3
```

## Setup-Anweisungen

### 1. Abhängigkeiten installieren
```bash
# Automatisches Setup (empfohlen)
node setup-electron.js

# Oder manuell:
npm install
npm install better-sqlite3
npx electron-rebuild
```

### 2. Testen
```bash
# Database-Test
node electron/test-db.js

# Entwicklung
npm run electron:dev-new

# Build
npm run build:electron-new
```

## Neue Dateien

### Electron-Hauptdateien:
- `electron/main-new.js` - Neuer Hauptprozess (ohne Express)
- `electron/database.js` - SQLite-Integration mit better-sqlite3
- `electron/ipc-handlers.js` - IPC-Handler für Datenbankoperationen
- `electron/preload.js` - Sicherer IPC-Zugang für Renderer

### Frontend-Integration:
- `src/api/index.ts` - Unified API (Browser + Electron)

## Vorteile der neuen Lösung

✅ **Keine separaten Serverprozesse**
✅ **Native SQLite-Performance**
✅ **Sichere IPC-Kommunikation**
✅ **Einfache Pfadverwaltung**
✅ **Bessere Fehlerbehandlung**
✅ **Kompatibel mit Browser und Electron**

## Verwendung in der React-App

```typescript
// Automatische Erkennung von Browser vs. Electron
import { api } from './api';

// Funktioniert in beiden Umgebungen
const products = await api.getProducts();
const scenes = await api.getScenes();
```

## Build-Konfiguration

Die neue `package.json` enthält:
- `better-sqlite3` statt `sqlite3`
- Angepasste Electron-Builder-Config
- Neue Scripts für neue Architektur

## Debugging

### Database-Test:
```bash
node electron/test-db.js
```

### Electron mit DevTools:
```bash
npm run electron:dev-new
```

### API-Test im Browser:
```bash
npm run dev
npm run db:server  # Für Browser-Fallback
```

## Migration von bestehender App

1. Ersetze API-Calls durch die neue `api` aus `src/api/index.ts`
2. Die neue API funktioniert automatisch in beiden Umgebungen
3. Keine Änderungen an React-Komponenten nötig

## Troubleshooting

### better-sqlite3 Build-Fehler:
```bash
# Windows: Visual Studio Build Tools installieren
npm install --global windows-build-tools

# Rebuild für Electron
npx electron-rebuild

# Alternative: von Source kompilieren
npm install better-sqlite3 --build-from-source
```

### Datenbankpfad-Probleme:
- Entwicklung: `database.sqlite` im Projektroot
- Packaged App: Automatisch in `userData` kopiert

### IPC-Kommunikation debuggen:
```javascript
// In DevTools Console
console.log(window.electronAPI);
```

## Nächste Schritte

1. **Testen**: `node setup-electron.js`
2. **Entwickeln**: `npm run electron:dev-new`
3. **Bauen**: `npm run build:electron-new`
4. **Migrieren**: Existing React-App auf neue API umstellen

Die neue Lösung ist deutlich robuster und einfacher zu debuggen als der Express-Server-Ansatz.
