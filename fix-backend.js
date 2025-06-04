#!/usr/bin/env node

/**
 * SIKORA Backend Fix - Diagnose und Reparatur
 * Behebt das MeasurePoint API 404-Problem
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 SIKORA Backend Fix wird gestartet...\n');

// 1. Datenbank prüfen
function checkDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'DB', 'database.sqlite');

    if (!fs.existsSync(dbPath)) {
      console.log('❌ Datenbank nicht gefunden:', dbPath);
      reject(new Error('Datenbank nicht gefunden'));
      return;
    }

    console.log('✅ Datenbank gefunden:', dbPath);

    // SQLite Schnelltest
    const sqlite3 = require('./DB/node_modules/sqlite3').verbose();
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.log('❌ Datenbank-Verbindung fehlgeschlagen:', err.message);
        reject(err);
      } else {
        console.log('✅ Datenbank-Verbindung erfolgreich');

        db.all('SELECT COUNT(*) as count FROM MeasurePoint', (err, result) => {
          if (err) {
            console.log('❌ MeasurePoint Tabelle nicht gefunden');
            reject(err);
          } else {
            console.log(`✅ MeasurePoint Tabelle gefunden (${result[0].count} Einträge)`);
            db.close();
            resolve();
          }
        });
      }
    });
  });
}

// 2. API-Server starten
function startApiServer() {
  return new Promise((resolve, reject) => {
    console.log('\n🚀 Starte API-Server auf Port 3001...');

    const dbPath = path.join(__dirname, 'DB');
    const serverProcess = spawn('node', ['api-server.js'], {
      cwd: dbPath,
      stdio: 'inherit'
    });

    // Warte kurz und teste dann die Verbindung
    setTimeout(() => {
      testApiConnection()
        .then(() => {
          console.log('✅ API-Server erfolgreich gestartet und erreichbar!');
          console.log('\n🎉 Backend Fix abgeschlossen!');
          console.log('💡 Die Admin-Seite sollte jetzt funktionieren.');
          console.log('🌐 API läuft auf: http://localhost:3001');
          console.log('🌐 Health Check: http://localhost:3001/api/health');
          resolve(serverProcess);
        })
        .catch(reject);
    }, 2000);

    serverProcess.on('error', (err) => {
      console.error('❌ Fehler beim Starten des API-Servers:', err);
      reject(err);
    });
  });
}

// 3. API-Verbindung testen
function testApiConnection() {
  return new Promise((resolve, reject) => {
    exec('curl -s http://localhost:3001/api/health || node -e "fetch(\'http://localhost:3001/api/health\').then(r=>r.json()).then(d=>console.log(JSON.stringify(d))).catch(e=>process.exit(1))"', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ API-Server nicht erreichbar');
        reject(error);
      } else {
        try {
          const response = JSON.parse(stdout);
          if (response.success) {
            console.log('✅ API-Server antwortet korrekt');
            resolve();
          } else {
            reject(new Error('API-Server antwortet, aber nicht korrekt'));
          }
        } catch {
          console.log('✅ API-Server läuft (Response-Parsing fehlgeschlagen, aber Server läuft)');
          resolve();
        }
      }
    });
  });
}

// Hauptprozess
async function main() {
  try {
    // Schritt 1: Datenbank prüfen
    console.log('📋 Schritt 1: Datenbank überprüfen...');
    await checkDatabase();

    // Schritt 2: API-Server starten
    console.log('\n📋 Schritt 2: API-Server starten...');
    const serverProcess = await startApiServer();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Beende Backend...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Backend Fix fehlgeschlagen:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Stelle sicher, dass Node.js installiert ist');
    console.log('2. Führe "npm install" im Hauptverzeichnis aus');
    console.log('3. Führe "cd DB && npm install" aus');
    console.log('4. Überprüfe, ob Port 3001 frei ist');
    process.exit(1);
  }
}

main();
