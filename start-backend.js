/**
 * Einfacher SIKORA Backend Starter
 * Löst das MeasurePoint API 404-Problem
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starte SIKORA API-Server für MeasurePoint Management...');
console.log('🎯 Problem: GET http://localhost:3000/api/measurepoints 404 (Not Found)');
console.log('🔧 Lösung: Starte Backend auf Port 3001\n');

// Starte den API-Server im DB-Verzeichnis
const dbPath = path.join(__dirname, 'DB');
console.log('📁 DB-Pfad:', dbPath);

const serverProcess = spawn('node', ['api-server.js'], {
  cwd: dbPath,
  stdio: 'inherit'
});

console.log('⏳ API-Server wird gestartet...');

serverProcess.on('error', (err) => {
  console.error('❌ Fehler beim Starten des API-Servers:', err);
  console.log('\n🔍 Troubleshooting:');
  console.log('1. cd DB && npm install');
  console.log('2. node api-server.js');
  process.exit(1);
});

serverProcess.on('spawn', () => {
  console.log('✅ API-Server erfolgreich gestartet!');
  console.log('🌐 Backend läuft auf: http://localhost:3001');
  console.log('📋 Verfügbare Endpoints:');
  console.log('  • GET  /api/measurepoints - Alle Messpunkte');
  console.log('  • POST /api/measurepoints - Neuer Messpunkt');
  console.log('  • PUT  /api/measurepoints/:id - Messpunkt bearbeiten');
  console.log('  • DELETE /api/measurepoints/:id - Messpunkt löschen');
  console.log('  • GET  /api/health - Server Status');
  console.log('\n🎉 Das MeasurePointManagement sollte jetzt funktionieren!');
});

serverProcess.on('close', (code) => {
  console.log(`🛑 API-Server beendet mit Code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Beende API-Server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Beende API-Server...');
  serverProcess.kill('SIGTERM');
});
