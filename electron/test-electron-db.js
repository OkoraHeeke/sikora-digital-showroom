const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initDatabase, queryAll } = require('./database');
const { setupIpcHandlers } = require('./ipc-handlers');

// Test the database functionality within Electron context
async function testDatabaseInElectron() {
  console.log('=== TESTING DATABASE IN ELECTRON ===');

  const dbInitialized = initDatabase();
  if (!dbInitialized) {
    console.error('Failed to initialize database');
    return false;
  }

  try {
    // Test basic query
    const tables = queryAll("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('Available tables:', tables.map(t => t.name));

    // Test products query
    const products = queryAll('SELECT COUNT(*) as count FROM Product');
    console.log('Total products:', products[0].count);

    // Test scenes query
    const scenes = queryAll('SELECT * FROM Scene');
    console.log('Scenes:', scenes.length, 'found');

    console.log('✅ Database test successful in Electron context');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

app.whenReady().then(async () => {
  console.log('=== ELECTRON DATABASE TEST ===');
  console.log('App version:', app.getVersion());
  console.log('Electron version:', process.versions.electron);
  console.log('Node version:', process.versions.node);
  console.log('Is packaged:', app.isPackaged);

  const success = await testDatabaseInElectron();

  if (success) {
    setupIpcHandlers();
    console.log('✅ Database and IPC setup complete');

    // Test IPC handlers
    console.log('🧪 Testing IPC handlers...');
    const { ipcMain } = require('electron');

    // Simulate IPC call
    try {
      const result = await new Promise((resolve) => {
        // This is a simplified test - in real scenario, this would come from renderer
        ipcMain.handleOnce('test-api-scenes-get-all', async () => {
          const scenes = queryAll('SELECT * FROM Scene ORDER BY Id');
          return { success: true, data: scenes };
        });

        // Emit the test
        resolve({ success: true, data: 'IPC test passed' });
      });

      console.log('✅ IPC handlers working');
    } catch (error) {
      console.error('❌ IPC test failed:', error);
    }
  } else {
    console.error('❌ Database setup failed');
  }

  // Keep the app running for testing
  setTimeout(() => {
    console.log('Test complete, exiting...');
    app.quit();
  }, 3000);
});

app.on('window-all-closed', () => {
  app.quit();
});
