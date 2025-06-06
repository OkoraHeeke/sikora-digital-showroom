# 🚀 Quick Start: Production Deployment

## ✅ Netlify Functions Setup (COMPLETED)

Das Backend ist jetzt für Netlify Functions konfiguriert:

### 1. Dependencies installieren
```bash
npm install serverless-http
```

### 2. Build und Test lokal
```bash
# Build erstellen
npm run build

# Local Netlify Dev (optional)
npx netlify dev

# Oder direkt testen
npm run preview
```

### 3. Netlify Deployment
```bash
# Netlify CLI (falls noch nicht installiert)
npm install -g netlify-cli

# Login und Deploy
netlify login
netlify deploy --prod
```

## 🖥️ Alternative: Electron Desktop App

### Setup für Desktop-Anwendung
```bash
# Electron Dependencies
npm install --save-dev electron electron-builder concurrently wait-on

# Package.json Scripts hinzufügen:
```

**Füge zu `package.json` hinzu:**
```json
{
  "main": "public/electron.js",
  "homepage": "./",
  "scripts": {
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "build:electron": "npm run build && electron-builder",
    "dist:electron": "npm run build && electron-builder --publish=never"
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
      "public/electron.js",
      "node_modules/**/*"
    ],
    "extraResources": [
      {
        "from": "DB/database.sqlite",
        "to": "DB/"
      }
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/logo.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/logo.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/logo.png"
    }
  }
}
```

**Erstelle `public/electron.js`:**
```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let apiServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../assets/logo.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Menu für bessere UX
  const template = [
    {
      label: 'SIKORA Digital Showroom',
      submenu: [
        { label: 'Über', role: 'about' },
        { type: 'separator' },
        { label: 'Beenden', role: 'quit' }
      ]
    },
    {
      label: 'Ansicht',
      submenu: [
        { label: 'Neu laden', role: 'reload' },
        { label: 'Vollbild', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Entwicklertools', role: 'toggleDevTools' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function startBackend() {
  if (!isDev) {
    // Production: Backend aus dem gepackten App-Verzeichnis starten
    const dbPath = path.join(process.resourcesPath, 'DB');
    apiServer = spawn('node', ['api-server.js'], {
      cwd: dbPath,
      stdio: 'pipe' // In Production nicht in Konsole loggen
    });
  }
  // In Development läuft Backend separat via npm run db:server
}

app.whenReady().then(() => {
  if (!isDev) {
    startBackend();
    // Backend Zeit zum Starten geben
    setTimeout(createWindow, 2000);
  } else {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (apiServer) {
    apiServer.kill();
  }
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Electron Build Commands
```bash
# Development
npm run electron:dev

# Production Build
npm run build:electron

# Distribution Package
npm run dist:electron
```

## 🧪 Testing Checklist

### Netlify Functions Test:
- [ ] `npm install serverless-http`
- [ ] `npm run build`
- [ ] `netlify dev` (lokal testen)
- [ ] `netlify deploy --prod`
- [ ] API Test: `https://your-site.netlify.app/api/health`

### Electron Test:
- [ ] Dependencies installiert
- [ ] `public/electron.js` erstellt
- [ ] `package.json` aktualisiert
- [ ] `npm run electron:dev` (Development)
- [ ] `npm run dist:electron` (Production)

## 🔍 Troubleshooting

### Netlify Functions
- **Database nicht gefunden**: SQLite-Datei in `netlify/functions/` kopieren
- **CORS Fehler**: Headers in `netlify.toml` prüfen
- **Function Timeout**: Queries optimieren

### Electron
- **Backend startet nicht**: Pfade in `electron.js` prüfen
- **Build schlägt fehl**: Icon-Dateien in `assets/` hinzufügen
- **Database nicht gefunden**: `extraResources` in `package.json` prüfen

## 📊 Performance Optimierung

### Netlify Functions
- Read-only Database (SQLite)
- Edge Caching für statische Assets
- Function bundling für bessere Cold Starts

### Electron
- Backend als separater Prozess
- Native Menu für bessere UX
- Auto-Updater für einfache Distribution

## 🎯 Nächste Schritte

1. **Sofort**: Netlify Functions implementieren für Web-Deployment
2. **Optional**: Electron für Desktop-Distribution
3. **Erweitert**: Docker für Full-Stack Self-Hosting

**Beide Lösungen sind parallel nutzbar!**
