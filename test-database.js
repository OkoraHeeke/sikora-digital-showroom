/**
 * Datenbank-Test für SIKORA Digital Showroom
 * Überprüft die SQLite-Datenbank und die Tabellen
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'DB', 'database.sqlite');

console.log('🔍 Überprüfe SIKORA Datenbank...');
console.log('Datenbank-Pfad:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Fehler beim Öffnen der Datenbank:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Datenbank-Verbindung erfolgreich');
    testDatabase();
  }
});

function testDatabase() {
  // Teste Tabellen
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
    if (err) {
      console.error('❌ Fehler beim Abrufen der Tabellen:', err);
      return;
    }

    console.log('\n📋 Verfügbare Tabellen:');
    tables.forEach(table => {
      console.log(`  • ${table.name}`);
    });

    // Teste Messpunkte
    console.log('\n🎯 Teste MeasurePoint Tabelle...');
    db.all('SELECT * FROM MeasurePoint LIMIT 5', (err, measurePoints) => {
      if (err) {
        console.error('❌ Fehler beim Abrufen der Messpunkte:', err);
      } else {
        console.log(`✅ ${measurePoints.length} Messpunkte gefunden:`);
        measurePoints.forEach(mp => {
          console.log(`  • ID ${mp.Id}: ${mp.Name_DE} / ${mp.Name_EN}`);
        });
      }

      // Teste Szenen
      console.log('\n🎬 Teste Scene Tabelle...');
      db.all('SELECT * FROM Scene LIMIT 5', (err, scenes) => {
        if (err) {
          console.error('❌ Fehler beim Abrufen der Szenen:', err);
        } else {
          console.log(`✅ ${scenes.length} Szenen gefunden:`);
          scenes.forEach(scene => {
            console.log(`  • ID ${scene.Id}: ${scene.Name_DE} / ${scene.Name_EN}`);
          });
        }

        console.log('\n🎉 Datenbank-Test abgeschlossen!');
        console.log('💡 Du kannst jetzt den API-Server starten: node start-backend.js');

        db.close();
      });
    });
  });
}
