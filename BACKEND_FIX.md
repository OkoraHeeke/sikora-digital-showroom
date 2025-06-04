# 🔧 SIKORA Backend Fix - MeasurePoint API

## 🎯 Problem
```
GET http://localhost:3000/api/measurepoints 404 (Not Found)
```

Die Admin-Seite (MeasurePointManagement.tsx) kann keine Messpunkte laden, weil der API-Server nicht läuft.

## ✅ Lösung

### Schnelle Lösung (Empfohlen)
```bash
# Backend starten
npm run backend:start
```

### Alternative Lösungen

#### Option 1: Direkt starten
```bash
node start-backend.js
```

#### Option 2: DB-Skript nutzen
```bash
npm run db:server
```

#### Option 3: Manuell im DB-Verzeichnis
```bash
cd DB
node api-server.js
```

## 🚀 Was passiert dann?

1. ✅ API-Server startet auf **Port 3001**
2. ✅ Frontend-Proxy leitet `/api/*` an `localhost:3001` weiter
3. ✅ MeasurePointManagement.tsx kann Daten laden
4. ✅ Admin-Seite funktioniert vollständig

## 📋 Verfügbare API-Endpoints

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/measurepoints` | Alle Messpunkte laden |
| POST | `/api/measurepoints` | Neuer Messpunkt |
| PUT | `/api/measurepoints/:id` | Messpunkt bearbeiten |
| DELETE | `/api/measurepoints/:id` | Messpunkt löschen |
| GET | `/api/health` | Server Status |

## 🔍 Debugging

### 1. API-Server Status prüfen
```bash
curl http://localhost:3001/api/health
```

### 2. Messpunkte direkt testen
```bash
curl http://localhost:3001/api/measurepoints
```

### 3. Datenbank testen
```bash
npm run backend:test
```

## 🛠️ Technische Details

- **Frontend**: React auf Port 3000 (Vite Dev Server)
- **Backend**: Express.js auf Port 3001
- **Proxy**: Vite leitet `/api/*` an Backend weiter
- **Datenbank**: SQLite (`DB/database.sqlite`)

## ⚡ Auto-Start Setup

Um das Backend automatisch mit dem Frontend zu starten:

1. **Terminal 1**: `npm run backend:start`
2. **Terminal 2**: `npm run dev`

Oder nutze einen Process Manager wie `concurrently`:

```bash
npm install -g concurrently
npx concurrently "npm run backend:start" "npm run dev"
```

## 🎉 Ergebnis

Nach dem Start sollten alle MeasurePoint-Funktionen in der Admin-Seite funktionieren:

- ✅ Messpunkte anzeigen
- ✅ Messpunkte hinzufügen
- ✅ Messpunkte bearbeiten
- ✅ Messpunkte löschen
- ✅ Produktzuordnungen verwalten
