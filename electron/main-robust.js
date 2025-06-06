const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let databaseModule = null;

// Try to load database module with fallback
function loadDatabaseModule() {
  try {
    console.log('Trying better-sqlite3...');
    databaseModule = require('./database');
    console.log('✅ Using better-sqlite3');
    return true;
  } catch (error) {
    console.log('⚠️ better-sqlite3 failed:', error.message);
    try {
      console.log('Trying sqlite3 fallback...');
      databaseModule = require('./database-fallback');
      console.log('✅ Using sqlite3 fallback');
      return true;
    } catch (fallbackError) {
      console.error('❌ Both database modules failed:', fallbackError.message);
      return false;
    }
  }
}

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

  // Try to load and initialize database
  const dbModuleLoaded = loadDatabaseModule();
  if (!dbModuleLoaded) {
    console.error('Failed to load any database module');
    app.quit();
    return;
  }

  // Initialize database
  const dbInitialized = databaseModule.initDatabase();
  if (!dbInitialized) {
    console.error('Failed to initialize database');
    app.quit();
    return;
  }

  // Setup IPC handlers with the loaded database module
  try {
    const { setupIpcHandlers } = require('./ipc-handlers');
    setupIpcHandlers();
    console.log('✅ IPC handlers initialized');
  } catch (error) {
    console.error('Failed to setup IPC handlers:', error);
    app.quit();
    return;
  }

  // Test database functionality
  try {
    const scenes = await databaseModule.queryAll('SELECT * FROM Scene');
    console.log(`✅ Database test successful - found ${scenes.length} scenes`);
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }

  // Create window
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (databaseModule) {
    databaseModule.closeDatabase();
  }
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
  if (databaseModule) {
    databaseModule.closeDatabase();
  }
});
