const Database = require('better-sqlite3');
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

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    console.log('Database initialized successfully');
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

// Helper functions for common database operations
function queryAll(sql, params = []) {
  const database = getDatabase();
  return database.prepare(sql).all(params);
}

function queryGet(sql, params = []) {
  const database = getDatabase();
  return database.prepare(sql).get(params);
}

function queryRun(sql, params = []) {
  const database = getDatabase();
  return database.prepare(sql).run(params);
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
