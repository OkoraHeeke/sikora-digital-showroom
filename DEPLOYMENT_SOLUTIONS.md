# SIKORA Digital Showroom - Deployment Lösungen

## 🔍 Problem-Analyse

Das SIKORA Digital Showroom besteht aus:
- **Frontend**: React + Vite (Port 3000)
- **Backend**: Express + SQLite (Port 3001)

**Development**: Frontend → Vite Proxy → Backend ✅
**Production**: Frontend → ❌ Kein Backend verfügbar

## 🚀 Lösung 1: Netlify Functions (Serverless)

### A. Backend als Netlify Functions umwandeln

```bash
# 1. Netlify CLI installieren
npm install -g netlify-cli

# 2. Netlify Functions Setup
mkdir netlify/functions
```

**Erstelle: `netlify/functions/api.js`**
```javascript
const express = require('express');
const serverless = require('serverless-http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());

// Datenbank-Setup für Serverless
const dbPath = '/tmp/database.sqlite';
const db = new sqlite3.Database(dbPath);

// API Routes hier einfügen...
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'OK' } });
});

// Alle anderen Routes aus DB/api-server.js

module.exports.handler = serverless(app);
```

**Update: `netlify.toml`**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### B. Environment Variables für Production

**Update: `src/services/database.ts`**
```typescript
class SikoraDatabaseService implements DatabaseService {
  private baseUrl: string;

  constructor() {
    // Production: Netlify Functions
    // Development: Vite Proxy
    this.baseUrl = import.meta.env.PROD
      ? '/.netlify/functions/api'
      : '/api';
  }
  // ... rest bleibt gleich
}
```

## 🚀 Lösung 2: Desktop App (Electron)

### A. Electron Setup

```bash
npm install --save-dev electron electron-builder concurrently
```

**Erstelle: `electron/main.js`**
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let apiServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../assets/logo.png')
  });

  // Load the built React app
  mainWindow.loadFile('dist/index.html');
}

function startBackend() {
  // Backend in separatem Prozess starten
  apiServer = spawn('node', ['DB/api-server.js'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, 2000); // Backend Zeit zum Starten geben
});

app.on('window-all-closed', () => {
  if (apiServer) apiServer.kill();
  app.quit();
});
```

**Update: `package.json`**
```json
{
  "main": "electron/main.js",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"npm run db:server\" \"electron .\"",
    "build:electron": "npm run build && electron-builder",
    "dist": "electron-builder --publish=never"
  },
  "build": {
    "appId": "com.sikora.digital-showroom",
    "productName": "SIKORA Digital Showroom",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "DB/**/*",
      "assets/**/*",
      "electron/main.js"
    ],
    "extraResources": [
      {
        "from": "DB/database.sqlite",
        "to": "DB/"
      }
    ]
  }
}
```

## 🚀 Lösung 3: Full-Stack Deployment (Docker/VPS)

### A. Unified Server Setup

**Erstelle: `server.js` (Root)**
```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// API Routes
const apiRouter = require('./DB/api-server-routes'); // Extrahierte Routes
app.use('/api', apiRouter);

// Static Files (React Build)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SIKORA Digital Showroom running on port ${PORT}`);
});
```

**Update: `package.json`**
```json
{
  "scripts": {
    "start": "node server.js",
    "build:production": "npm run build && npm run start"
  }
}
```

### B. Docker Setup

**Erstelle: `Dockerfile`**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build
COPY . .
RUN npm run build

# Production server
EXPOSE 3000
CMD ["npm", "start"]
```

**Erstelle: `docker-compose.yml`**
```yaml
version: '3.8'
services:
  sikora-showroom:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./DB/database.sqlite:/app/DB/database.sqlite
    environment:
      - NODE_ENV=production
```

## 🎯 Empfohlene Lösung je Szenario

### 📊 **Für Demos/Marketing (Netlify)**
- ✅ Kostenlos für kleine Projekte
- ✅ Automatisches Deployment via Git
- ✅ CDN und HTTPS
- ❌ Serverless Limitationen

### 💼 **Für interne Nutzung (Electron)**
- ✅ Vollständige Kontrolle
- ✅ Offline verfügbar
- ✅ Native Desktop App
- ✅ Einfache Verteilung

### 🏢 **Für Produktion (Full-Stack)**
- ✅ Skalierbar
- ✅ Vollständige Backend-Features
- ✅ Einfache Wartung
- ❌ Server-Kosten

## 🔧 Schnelle Implementierung

### Für Netlify Functions:
```bash
npm install serverless-http
mkdir -p netlify/functions
# Dann API-Code in netlify/functions/api.js kopieren
```

### Für Electron:
```bash
npm install --save-dev electron electron-builder
mkdir electron
# Dann main.js erstellen
```

### Für Full-Stack:
```bash
# server.js erstellen und API-Routes extrahieren
```

## 🧪 Testing

Nach jeder Lösung:
```bash
# Build testen
npm run build

# Production testen
npm run preview

# API Health Check
curl http://localhost:3000/api/health
```
