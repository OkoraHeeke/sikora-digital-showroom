const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { initDatabase, closeDatabase } = require('./database');
const { setupIpcHandlers } = require('./ipc-handlers');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/logo.png'),
    title: 'SIKORA Digital Showroom'
  });

  // Load the built React app
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.log('=== ELECTRON APP STARTING ===');
  console.log('App version:', app.getVersion());
  console.log('Electron version:', process.versions.electron);
  console.log('Node version:', process.versions.node);
  console.log('Is packaged:', app.isPackaged);

  // Initialize database
  const dbInitialized = initDatabase();
  if (!dbInitialized) {
    console.error('Failed to initialize database');
    app.quit();
    return;
  }

  // Setup IPC handlers
  setupIpcHandlers();

  // Create window
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('App is quitting...');
  closeDatabase();
});
