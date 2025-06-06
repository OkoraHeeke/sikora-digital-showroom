const path = require('path');
const fs = require('fs');

// Simple database test without Electron app context
function testDatabase() {
  console.log('=== TESTING DATABASE (Node.js) ===');

  try {
    // Check if better-sqlite3 is available
    const Database = require('better-sqlite3');
    console.log('✅ better-sqlite3 module loaded');

    // Check if database file exists
    const dbPath = path.join(__dirname, '..', 'database.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Database file not found:', dbPath);
      return false;
    }
    console.log('✅ Database file found:', dbPath);

    // Test database connection
    const db = new Database(dbPath);
    console.log('✅ Database connection established');

    // Test basic query
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('✅ Available tables:', tables.map(t => t.name));

    // Test products query
    const products = db.prepare('SELECT COUNT(*) as count FROM Product').get();
    console.log('✅ Total products:', products.count);

    // Test scenes query
    const scenes = db.prepare('SELECT * FROM Scene').all();
    console.log('✅ Scenes:', scenes.length, 'found');

    // Close database
    db.close();
    console.log('✅ Database connection closed');

    console.log('');
    console.log('🎉 Database test successful! SQLite integration is working.');
    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('- better-sqlite3 not properly compiled for your system');
    console.error('- Database file is corrupted');
    console.error('- Missing Visual Studio Build Tools (Windows)');
    console.error('');
    console.error('Try running: npx electron-rebuild');
    return false;
  }
}

// Run the test
const success = testDatabase();
process.exit(success ? 0 : 1);
