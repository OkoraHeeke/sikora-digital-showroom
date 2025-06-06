#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Electron with better-sqlite3...');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function setup() {
  try {
    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    await runCommand('npm', ['install']);

    // 2. Install better-sqlite3 for Electron
    console.log('🔧 Installing better-sqlite3 for Electron...');
    await runCommand('npm', ['install', 'better-sqlite3']);

    // 3. Rebuild for Electron
    console.log('🔨 Rebuilding native modules for Electron...');
    await runCommand('npx', ['electron-rebuild']);

    // 4. Test in Electron context (skip Node.js test due to version conflicts)
    console.log('🔬 Testing database in Electron context...');
    console.log('ℹ️  Skipping Node.js test - better-sqlite3 is compiled for Electron');
    await runCommand('npx', ['electron', 'electron/test-electron-db.js']);

    console.log('✅ Setup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Run "npm run electron:dev-new" to test in development');
    console.log('2. Run "npm run build:electron-new" to create executable');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting tips:');
    console.log('1. Make sure you have Python and Visual Studio Build Tools installed');
    console.log('2. Try running "npm install --build-from-source"');
    console.log('3. Check that Node.js and Electron versions are compatible');
    process.exit(1);
  }
}

// Check if we have the required files
const requiredFiles = [
  'electron/database.js',
  'electron/ipc-handlers.js',
  'electron/preload.js',
  'electron/main-new.js',
  'database.sqlite'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}

setup();
