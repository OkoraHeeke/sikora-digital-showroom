# 🏗️ SIKORA Backend System - Vollständige Architektur

## 🎯 Problem gelöst: MeasurePoint API 404

**Status**: ✅ **BEHOBEN**

Der Fehler `GET http://localhost:3000/api/measurepoints 404 (Not Found)` ist gelöst.

## 🔧 Lösung umgesetzt

### 1. API-Server ist vollständig implementiert
- ✅ Alle MeasurePoint CRUD-Operationen
- ✅ Vollständige Express.js API auf Port 3001
- ✅ SQLite-Datenbank mit allen Tabellen
- ✅ CORS und Middleware konfiguriert

### 2. Frontend-Proxy konfiguriert
- ✅ Vite Proxy: `/api/*` → `http://localhost:3001`
- ✅ MeasurePointManagement.tsx korrekt implementiert

### 3. Start-Skripte erstellt
- ✅ `node start-backend.js` - Einfacher Server-Start
- ✅ `npm run backend:start` - Package.json Skript
- ✅ `npm run db:server` - Direkter DB-Server Start

## 🚀 So startest du das Backend

```bash
# Methode 1: Einfachster Weg
npm run backend:start

# Methode 2: Direkt
node start-backend.js

# Methode 3: Im DB-Verzeichnis
cd DB && node api-server.js
```

## 📋 Vollständige API-Übersicht

### MeasurePoints (Messpunkte)
| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/measurepoints` | Alle Messpunkte mit Szene-Info |
| POST | `/api/measurepoints` | Neuen Messpunkt erstellen |
| PUT | `/api/measurepoints/:id` | Messpunkt aktualisieren |
| DELETE | `/api/measurepoints/:id` | Messpunkt löschen |
| GET | `/api/measurepoints/:id` | Einzelner Messpunkt |
| GET | `/api/measurepoints/:id/products` | Produkte für Messpunkt |

### Scenes (Szenen)
| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/scenes` | Alle Szenen |
| GET | `/api/scenes/:id` | Einzelne Szene |
| GET | `/api/scenes/:id/measurepoints` | Messpunkte für Szene |
| GET | `/api/scenes/:id/complete` | Szene mit 3D-Objekten |

### Products (Produkte)
| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/products` | Alle Produkte |
| GET | `/api/products/:name` | Einzelnes Produkt |
| GET | `/api/products/:name/specifications` | Produkt-Spezifikationen |
| GET | `/api/products/:name/features` | Produkt-Features |
| GET | `/api/products/:name/advantages` | Produkt-Vorteile |
| GET | `/api/products/:name/installation` | Installation-Info |
| GET | `/api/products/:name/datasheet` | Datenblatt |

### MeasureParameters (Messparameter)
| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/measureparameters` | Alle Messparameter |
| POST | `/api/measureparameters` | Neuer Messparameter |
| PUT | `/api/measureparameters/:id` | Messparameter aktualisieren |
| DELETE | `/api/measureparameters/:id` | Messparameter löschen |

### Utilities
| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | `/api/health` | Server Status |
| GET | `/api/debug/tables` | Alle DB-Tabellen |
| GET | `/api/debug/schema/:table` | Tabellen-Schema |
| GET | `/api/assets/*` | Statische Assets |
| GET | `/api/placeholder/:width/:height` | Placeholder-Bilder |

## 🗄️ Datenbank-Schema

### Haupttabellen
- **Scene** - Szenen (z.B. "Wire & Cable CV Line")
- **MeasurePoint** - Messpunkte (z.B. "Inlet Zone", "Extrusion Zone")
- **Product** - SIKORA Produkte (X-RAY, LASER, etc.)
- **MeasureParameter** - Messparameter (Durchmesser, Wanddicke, etc.)
- **ProductCategory** - Produktkategorien

### Verknüpfungstabellen
- **Join_MeasurePoint_MeasureParameter** - Welche Parameter an welchem Messpunkt
- **Join_Product_MeasureParameter** - Welche Produkte messen welche Parameter
- **Join_Scene_Product** - Welche Produkte in welcher Szene
- **AntiJoin_MeasurePoint_Product** - Produkt-Ausschlüsse

### 3D & Assets
- **Object3D** - 3D-Modell URLs
- **Map_Scene_Object3D_Static_Placement** - 3D-Objektpositionen
- **ProductDatasheet** - Datenblatt-Links

## 🔌 Frontend-Integration

### React Komponenten verwenden die API
```typescript
// MeasurePointManagement.tsx (Zeile 73)
const response = await fetch('/api/measurepoints');

// Proxy-Weiterleitung über vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

### Typische API-Verwendung
```typescript
// Alle Messpunkte laden
const measurePoints = await fetch('/api/measurepoints').then(r => r.json());

// Neuen Messpunkt erstellen
await fetch('/api/measurepoints', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    Name_EN: 'Cooling Zone',
    Name_DE: 'Kühlzone',
    SpacePosX: 10.5,
    SpacePosY: 0,
    SpacePosZ: 0,
    Scene_Id: 1
  })
});
```

## 🛠️ Entwickler-Workflow

### Backend-Entwicklung
1. **Code bearbeiten**: `DB/api-server.js`
2. **Server neustarten**: `Ctrl+C` → `npm run backend:start`
3. **API testen**: `curl http://localhost:3001/api/health`

### Frontend-Entwicklung
1. **Backend läuft**: `npm run backend:start` (Terminal 1)
2. **Frontend starten**: `npm run dev` (Terminal 2)
3. **Admin-Seite öffnen**: `http://localhost:3000/admin`

### Debugging
```bash
# API-Endpoints testen
curl http://localhost:3001/api/measurepoints
curl http://localhost:3001/api/scenes
curl http://localhost:3001/api/products

# Datenbank direkt prüfen
node test-database.js
```

## 🎉 Ergebnis

**Das MeasurePoint Management funktioniert jetzt vollständig:**

- ✅ Admin-Seite lädt alle Messpunkte
- ✅ Neue Messpunkte können erstellt werden
- ✅ Bestehende Messpunkte können bearbeitet werden
- ✅ Messpunkte können gelöscht werden
- ✅ Szenen-Filter funktioniert
- ✅ 3D-Positionierung wird unterstützt
- ✅ Produkt-Zuordnungen sind vorbereitet

## 🚨 Wichtiger Hinweis

**Immer das Backend zuerst starten**, bevor du die Frontend-Admin-Seite verwendest:

```bash
npm run backend:start
```

Dann in einem anderen Terminal:

```bash
npm run dev
```
