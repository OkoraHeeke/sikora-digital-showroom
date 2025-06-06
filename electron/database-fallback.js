const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db = null;

function getDatabasePath() {
  if (app.isPackaged) {
    // In der gepackten App - Datenbank im userData Verzeichnis
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'database.sqlite');
  } else {
    // In der Entwicklung - verwende die lokale Datenbank
    return path.join(__dirname, '..', 'database.sqlite');
  }
}

function copyDatabaseIfNeeded() {
  const dbPath = getDatabasePath();
  const sourcePath = path.join(__dirname, '..', 'database.sqlite');

  if (app.isPackaged && !fs.existsSync(dbPath)) {
    // In der gepackten App - kopiere Datenbank zum userData Pfad
    const resourceDbPath = path.join(process.resourcesPath, 'app', 'database.sqlite');

    if (fs.existsSync(resourceDbPath)) {
      console.log('Copying database from resources to userData...');
      fs.copyFileSync(resourceDbPath, dbPath);
    } else if (fs.existsSync(sourcePath)) {
      console.log('Copying database from source to userData...');
      fs.copyFileSync(sourcePath, dbPath);
    } else {
      throw new Error('Database file not found');
    }
  }

  return dbPath;
}

function initDatabase() {
  try {
    const dbPath = copyDatabaseIfNeeded();
    console.log('Initializing database at:', dbPath);

    db = new sqlite3.Database(dbPath);

    console.log('Database initialized successfully (sqlite3 fallback)');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

function getDatabase() {
  if (!db) {
    if (!initDatabase()) {
      throw new Error('Database not initialized');
    }
  }
  return db;
}

// Helper functions for common database operations (Promise-based)
function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function queryGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  queryAll,
  queryGet,
  queryRun,
  closeDatabase
};
